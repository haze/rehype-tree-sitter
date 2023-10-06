import { visit, SKIP } from "unist-util-visit";
import { rehype } from "rehype";
import { createRequire } from "node:module";
import { h } from "hastscript";
import os from 'node:os';
import stringByteSlice from "string-byte-slice";
const require = createRequire(import.meta.url);

const lookup = {
    "darwin-x64": "./dist/x86_64-apple-darwin.node",
    "linux-x64": "./dist/x86_64-unknown-linux-gnu.node",
    "darwin-arm64": "./dist/aarch64-apple-darwin.node",
}

const core = require(lookup[`${os.platform()}-${os.arch()}`] ?? "./dist/index.node");

const exampleScopeMap = {
    javascript: "source.js",
    sh: "source.bash",
    xml: "source.xml",
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
	    const inputLanguage = node.properties.className[0];
	    node.children = [];
	    const highlightStack = [];
	    const language = inputLanguage.split("-")[1];
	    core.driver(
		options.treeSitterGrammarRoot,
		(options.scopeMap || exampleScopeMap)[language] ?? "",
		language,
		code,
		(event) => {
		    if (event.source !== undefined) {
			const sourceChunk = stringByteSlice(
			    code,
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
