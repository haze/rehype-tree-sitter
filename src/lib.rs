use std::path::PathBuf;

use node_bindgen::core::NjError;
use node_bindgen::derive::node_bindgen;
use tree_sitter_highlight::Highlighter;

#[node_bindgen]
enum SerializableHighlightEvent {
    Source { start: usize, end: usize },
    HighlightStart { highlight_name: String },
    HighlightEnd,
}

impl From<(tree_sitter_highlight::HighlightEvent, &[String])> for SerializableHighlightEvent {
    fn from(value: (tree_sitter_highlight::HighlightEvent, &[String])) -> Self {
        match value.0 {
            tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                Self::Source { start, end }
            }
            tree_sitter_highlight::HighlightEvent::HighlightStart(highlight) => {
                Self::HighlightStart {
                    highlight_name: value.1[highlight.0].clone(),
                }
            }
            tree_sitter_highlight::HighlightEvent::HighlightEnd => Self::HighlightEnd,
        }
    }
}

#[node_bindgen]
fn driver<F: Fn(SerializableHighlightEvent)>(
    language_root_path: String,
    raw_maybe_root_scope: String,
    language_id: String,
    source: String,
    callback: F,
) -> Result<(), NjError> {
    let maybe_root_scope = if raw_maybe_root_scope.is_empty() {
        None
    } else {
        Some(raw_maybe_root_scope)
    };
    let mut loader = tree_sitter_loader::Loader::new().map_err(|why| {
        NjError::Other(format!(
            "Failed to create `tree_sitter_loader::Loader`: {}",
            &why
        ))
    })?;
    loader
        .find_all_languages(&tree_sitter_loader::Config {
            parser_directories: {
                let mut vec = Vec::new();
                vec.push(PathBuf::from(language_root_path));
                vec
            },
            ..Default::default()
        })
        .map_err(|why| {
            NjError::Other(format!(
                "{}: Failed to call `find_all_languages`: {}",
                language_id, &why
            ))
        })?;

    let load_result = if let Some(root_scope) = maybe_root_scope {
        loader.language_configuration_for_scope(&root_scope)
    } else {
        let file_name = format!("file.{}", &*language_id);
        loader.language_configuration_for_file_name(std::path::Path::new(&*file_name))
    };

    let (language, language_configuration) = 
        load_result
        .map_err(|why| {
            NjError::Other(format!(
                "{}: Failed to call `language_configuration_for_scope` or `language_configuration_for_file_name`: {}",
                language_id, &why
            ))
        })?
        .ok_or(NjError::Other(format!(
            "{}: Missing Language Configuration",
            language_id,
        )))?;
    let highlight_config = language_configuration
        .highlight_config(language)
        .map_err(|why| NjError::Other(format!("Failed to call `highlight_config`: {}", &why)))?
        .ok_or(NjError::Other(format!(
            "{}: Missing Highlight Configuration",
            language_id,
        )))?
        .clone();
    let mut highlighter = Highlighter::new();
    let mut highlight_iter = highlighter
        .highlight(highlight_config, source.as_bytes(), None, |_| None)
        .map_err(|why| {
            NjError::Other(format!(
                "{}: Failed to get highlight event iterator: {}",
                language_id, &why
            ))
        })?;

    let highlight_names = loader.highlight_names();
    while let Some(Ok(event)) = highlight_iter.next() {
        callback((event, highlight_names.as_slice()).into());
    }

    Ok(())
}
