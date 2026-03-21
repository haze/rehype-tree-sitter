import type { Root } from "hast";
import type { Plugin } from "unified";

/**
 * A map from language identifiers to tree-sitter scope names.
 *
 * @example
 * ```js
 * { javascript: "source.js", sh: "source.bash" }
 * ```
 */
export interface ScopeMap {
  [language: string]: string;
}

/**
 * Configuration for the rehype-tree-sitter plugin.
 */
export interface Options {
  /**
   * Path to the directory containing tree-sitter grammar repositories.
   *
   * Each grammar should be in a subdirectory (e.g., `tree-sitter-javascript/`).
   */
  treeSitterGrammarRoot: string;

  /**
   * A map from language identifiers (as used in `language-*` class names)
   * to tree-sitter scope names.
   *
   * If not provided, a small built-in map is used:
   * - `javascript` → `source.js`
   * - `sh` → `source.bash`
   * - `xml` → `source.xml`
   */
  scopeMap?: ScopeMap;
}

/**
 * A rehype plugin that uses tree-sitter to provide syntax highlighting
 * for `<pre><code>` blocks in HTML.
 *
 * Code blocks are identified by a `language-*` class on the `<code>` element.
 * The plugin replaces the text content with `<span>` elements whose class
 * names correspond to tree-sitter highlight groups (e.g., `keyword`,
 * `function`, `variable.parameter`).
 */
declare const rehypeTreeSitter: Plugin<[Options], Root>;
export default rehypeTreeSitter;
