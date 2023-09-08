use std::path::PathBuf;

use neon::prelude::*;

use tree_sitter_highlight::Highlighter;

fn driver(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let language_root_path = cx.argument::<JsString>(0)?.value(&mut cx);
    let raw_maybe_root_scope = cx.argument::<JsString>(1)?.value(&mut cx);
    let language_id = cx.argument::<JsString>(2)?.value(&mut cx);
    let source = cx.argument::<JsString>(3)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(4)?;

    let maybe_root_scope = if raw_maybe_root_scope.is_empty() {
        None
    } else {
        Some(raw_maybe_root_scope)
    };
    let mut loader = match tree_sitter_loader::Loader::new() {
        Ok(loader) => loader,
        Err(why) => {
            return cx.throw_error(format!(
                "Failed to create `tree_sitter_loader::Loader`: {}",
                &why
            ))
        }
    };

    if let Err(why) = loader.find_all_languages(&tree_sitter_loader::Config {
        parser_directories: {
            let mut vec = Vec::new();
            vec.push(PathBuf::from(language_root_path));
            vec
        },
        ..Default::default()
    }) {
        return cx.throw_error(format!(
            "{}: Failed to call `find_all_languages`: {}",
            language_id, &why
        ));
    }

    let load_result = if let Some(root_scope) = maybe_root_scope {
        loader.language_configuration_for_scope(&root_scope)
    } else {
        let file_name = format!("file.{}", &*language_id);
        loader.language_configuration_for_file_name(std::path::Path::new(&*file_name))
    };

    let (language, language_configuration) = match load_result {
        Ok(Some(result)) => result,
        Ok(None) => return cx.throw_error(format!(
            "{}: Missing Language Configuration",
            language_id
        )),
        Err(why) => return cx.throw_error(format!(
            "{}: Failed to call `language_configuration_for_scope` or `language_configuration_for_file_name`: {}",
            language_id, &why
        )),
    };
    let highlight_config = match language_configuration.highlight_config(language) {
        Ok(Some(config)) => config,
        Ok(None) => {
            return cx.throw_error(format!("{}: Missing Highlight Configuration", language_id,))
        }
        Err(why) => return cx.throw_error(format!("Failed to call `highlight_config`: {}", &why)),
    };
    let mut highlighter = Highlighter::new();
    let mut highlight_iter =
        match highlighter.highlight(highlight_config, source.as_bytes(), None, |_| None) {
            Ok(iter) => iter,
            Err(why) => {
                return cx.throw_error(format!(
                    "{}: Failed to get highlight event iterator: {}",
                    language_id, &why
                ))
            }
        };

    let highlight_names = loader.highlight_names();

    while let Some(Ok(event)) = highlight_iter.next() {
        let mut call_attempt = callback.call_with(&mut cx);
        let call_attempt = match event {
            tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                let event_object = cx.empty_object();
                let internal_object = cx.empty_object();
                let start_number = cx.number(start as u32);
                internal_object.set(&mut cx, "start", start_number)?;
                let end_number = cx.number(end as u32);
                internal_object.set(&mut cx, "end", end_number)?;
                event_object.set(&mut cx, "source", internal_object)?;
                call_attempt.arg(event_object)
            }
            tree_sitter_highlight::HighlightEvent::HighlightStart(group_index) => {
                let highlight_name = &highlight_names[group_index.0];
                let event_object = cx.empty_object();
                let internal_object = cx.empty_object();
                let highlight_name_string = cx.string(highlight_name);
                internal_object.set(&mut cx, "highlightName", highlight_name_string)?;
                event_object.set(&mut cx, "highlightStart", internal_object)?;
                call_attempt.arg(event_object)
            }
            tree_sitter_highlight::HighlightEvent::HighlightEnd => &mut call_attempt,
        };
        call_attempt.apply::<JsUndefined, CallContext<'_, JsObject>>(&mut cx)?;
    }

    Ok(cx.undefined())
}

#[neon::main]
pub fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("driver", driver)?;
    Ok(())
}
