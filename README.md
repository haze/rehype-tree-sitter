# rehype-tree-sitter

[![Build][build-badge]][build]

**[rehype][]** plugin to use `tree-sitter` to highlight code in `<pre><code>` blocks

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(rehypeTreeSitter[, options])`](#unifieduserehypetreesitter-options)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([rehype][]) plugin to highlight code within
a `hast` document. This plugin scans the source node tree for a `<pre><code>` element pair
that contains a `language-{}` attribute, and runs the tree-sitter highlight code. This produces a list of
annotated spans that can be customized with css.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**rehype** adds support for HTML to unified.
**hast** is the HTML AST that rehype uses.
This is a rehype plugin that highlights code using tree-sitter.

## When should I use this?

This plugin is useful when you want a more sophisticated highlighting experience
than what TextMate grammars provide. 

This plugin is built on [`hastscript`][hastscript], which does the work on
syntax trees.
rehype focusses on making it easier to transform content by abstracting such
internals away.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install rehype-tree-sitter
```

## Use


### TODO

## API

This package exports no identifiers.
The default export is `rehypeTreeSitter`.

### `unified().use(rehypeTreeSitter[, options])`

Highlight the code within the tree. This works by transforming the text within the code block into annotated `<span>` elements. The span elements will have their class list as the highlight name stack from tree-sitter.

##### `options`

Configuration.

###### `options.treeSitterGrammarRoot`

This option is **REQUIRED**. This is the source folder path on your file system where tree-sitter will look for grammar
source repositories. Without this variable set, the plugin will throw an error asking you to set it.

###### `options.scopeMap`

This option is a mapping of `language-{}` to `tree-sitter` scope (`source.js`, `scope.xml`, `scope.sh`). There is a default mapping included that supports a couple languages, but if you are using a custom grammar, it's required that you place the mapping between language identifier (usually found in the code block attributes) and the scope.

This option is **OPTIONAL**. This is the source folder path on your file system where tree-sitter will look for grammar
source repositories. Without this variable set, the plugin will throw an error asking you to set it.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.

## Security

This plugin compiles and executes Rust code. In the Rust code, an underlying dependency (tree-sitter) will attempt to read
tree-sitter grammar source repositories and compile and execute them. Please take care with your tree-sitter grammar repositories, and
audit them to make sure the code is safe to run. Other than that, the plugin is safe.

## License

[BSD-2-Clause][license] © [Haze Booth][author]

<!-- Definitions -->

[build-badge]: https://github.com/rehypejs/rehype-raw/workflows/main/badge.svg

[build]: https://github.com/rehypejs/rehype-raw/actions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://haz.ee

[typescript]: https://www.typescriptlang.org

[unified]: https://github.com/unifiedjs/unified

[rehype]: https://github.com/rehypejs/rehype

[hast]: https://github.com/syntax-tree/hast

[hast-util-raw]: https://github.com/syntax-tree/hast-util-raw

[parse5]: https://github.com/inikulin/parse5