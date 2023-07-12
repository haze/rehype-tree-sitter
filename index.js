import { visit } from 'unist-util-visit';
import { execSync } from 'child_process';
import { temporaryFile } from 'tempy';
import { writeFileSync, unlinkSync } from 'fs';
import { rehype } from 'rehype';

const exampleScopeMap = {
    'language-javascript': 'source.js',
};

const isCodeBlockElement = (node) => node.tagName === 'code' && node.children.length === 1;
export function treeSitterHighlight(options) {
    return function (tree) {
        visit(tree, isCodeBlockElement, (node, index, parent) => {
            const code = node.children[0].value;
            const language = node.properties.className[0];
            const temporarySourceFile = temporaryFile()
            writeFileSync(temporarySourceFile, code);
            const result = execSync(`tree-sitter highlight --scope ${exampleScopeMap[language]} -H ${temporarySourceFile}`).toString();
            unlinkSync(temporarySourceFile);
            const resultTree = rehype().parse(result);
            const codeTable = resultTree.children[1].children[2].children[1];
            parent.children[0].children = [codeTable];
        })
    }
}
