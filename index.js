import { visit } from 'unist-util-visit';
import { execSync } from 'child_process';
import { temporaryFile } from 'tempy';
import { writeFileSync, unlinkSync } from 'fs';
import { rehype } from 'rehype';

const exampleScopeMap = {
    'language-javascript': 'source.js',
    'language-sh': 'source.bash',
    'language-xml': 'source.xml',
};

function doesNodeHaveChildTable(node) {
    for (const child of node.children) {
        if (child.tagName === 'table')
            return true;
    }
    return false;
}

const isCodeBlockElement = (node) =>
    node.tagName === 'code'; //  && node.children.length === 1 && ;
export function rehypeTreeSitter(options) {
    return function (tree) {
        visit(tree, isCodeBlockElement, (node, index, parent) => {
            if (Object.keys(node.properties).length === 0) return;
            const code = node.children[0].value;
            const language = node.properties.className[0];
            if (!(language in exampleScopeMap)) return;
            const temporarySourceFile = temporaryFile()
            writeFileSync(temporarySourceFile, code);
            try {
                const result = execSync(`tree-sitter highlight --scope ${exampleScopeMap[language]} -H ${temporarySourceFile}`).toString();
                const resultTree = rehype().parse(result);
                const resultBody = resultTree.children[1].children[2];
                if (!doesNodeHaveChildTable(resultBody)) {
                    console.error(`No 'highlights.scm' found for ${language}`);
                    return;
                }
                const codeTable = resultTree.children[1].children[2].children[1];
                parent.children[0].children = [codeTable];
            } catch (error) {
                console.error(error);
            }
            unlinkSync(temporarySourceFile);
        })
    }
}
