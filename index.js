import { visit, SKIP } from "unist-util-visit";
import { rehype } from "rehype";
import { createRequire } from "node:module";
import { h } from "hastscript";
const require = createRequire(import.meta.url);
const core = require("./dist/index.node");

const exampleScopeMap = {
  "language-javascript": "source.js",
  "language-sh": "source.bash",
  "language-xml": "source.xml",
};

const isCodeBlockElement = (node) => node.tagName === "code";
export default function rehypeTreeSitter(options) {
  if (options === undefined)
    throw new Error("Need to provide `options.treeSitterGrammarRoot`");
  if (options.treeSitterGrammarRoot === undefined)
    throw new Error("Need to provide `options.treeSitterGrammarRoot`");
  return function (tree) {
    visit(tree, isCodeBlockElement, (node, index, parent) => {
      if (Object.keys(node.properties).length === 0) return;
      const code = node.children[0].value;
      const language = node.properties.className[0];
      if (!(language in exampleScopeMap)) return;
      // remove the source text
      node.children = [];
      const highlightStack = [];
      core.driver(
        options.treeSitterGrammarRoot,
        (options.scopeMap || exampleScopeMap)[language],
        code,
        (event) => {
          if (event.source !== undefined) {
            const sourceChunk = code.slice(
              Number(event.source.start),
              Number(event.source.end)
            );
            if (highlightStack.length === 0) {
              node.children.push({ type: "text", value: sourceChunk });
            } else {
              node.children.push(
                h("span", { class: highlightStack.join(" ") }, sourceChunk)
              );
            }
          } else if (event.highlightStart !== undefined) {
            highlightStack.push(event.highlightStart.highlightName);
          } else if (event === "HighlightEnd") {
            highlightStack.pop();
          }
        }
      );
    });
  };
}
