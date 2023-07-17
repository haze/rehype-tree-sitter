use std::path::PathBuf;

use tree_sitter_highlight::Highlighter;

#[derive(Debug)]
enum Error {
    NoScopeProvided,
    MissingLanguageConfiguration,
    MissingHighlightConfiguration,
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
impl std::error::Error for Error {}
/// demo program
/// - load grammar folder path from environment variable `TREE_SITTER_LANGUAGE_ROOT`
/// - accept input from stdin
/// - output vec of annotated spans

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let language_root_path = std::env::var("TREE_SITTER_LANGUAGE_ROOT")?;
    let mut loader = tree_sitter_loader::Loader::new()?;
    loader.find_all_languages(&tree_sitter_loader::Config {
        parser_directories: {
            let mut vec = Vec::new();
            vec.push(PathBuf::from(language_root_path));
            vec
        },
        ..Default::default()
    })?;

    let mut process_arg_iter = std::env::args().skip(1);
    let root_scope = format!(
        "source.{}",
        process_arg_iter.next().ok_or(Error::NoScopeProvided)?
    );
    let source = std::io::read_to_string(std::io::stdin())?;
    let (language, language_configuration) = loader
        .language_configuration_for_scope(&*root_scope)?
        .ok_or(Error::MissingLanguageConfiguration)?;
    let highlight_config = language_configuration
        .highlight_config(language)?
        .ok_or(Error::MissingHighlightConfiguration)?
        .clone();
    let mut highlighter = Highlighter::new();
    let mut highlight_iter =
        highlighter.highlight(highlight_config, source.as_bytes(), None, |_| None)?;
    while let Some(Ok(event)) = highlight_iter.next() {
        match event {
            tree_sitter_highlight::HighlightEvent::Source { start, end } => {
                print!("{}", &source[start..end])
            }
            tree_sitter_highlight::HighlightEvent::HighlightStart(_)
            | tree_sitter_highlight::HighlightEvent::HighlightEnd => {}
        }
        // dbg!(&event);
    }
    println!("");
    Ok(())
}
