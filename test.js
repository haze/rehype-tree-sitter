const treeSitterHighlight = import './index.js';
const { rehype } = import 'rehype';

test('highlights javascript code', () => {
    const html = '<pre><code class="language-javascript">function sum(a, b) { return a + b; }</code></pre>'
    const expectedOutput = `<table>
<tr><td class=line-number>1</td><td class=line><span style='color: #5f00d7'>function</span> <span style='color: #005fd7'>sum</span><span style='color: #4e4e4e'>(</span><span style='text-decoration: underline;'>a</span><span style='color: #4e4e4e'>,</span> <span style='text-decoration: underline;'>b</span><span style='color: #4e4e4e'>)</span> <span style='color: #4e4e4e'>{</span> <span style='color: #5f00d7'>return</span> <span style='text-decoration: underline;'>a</span> <span style='font-weight: bold;color: #4e4e4e'>+</span> <span style='text-decoration: underline;'>b</span><span style='color: #4e4e4e'>;</span> <span style='color: #4e4e4e'>}</span>
</td></tr>
</table>`
    const processor = rehype().use(treeSitterHighlight).freeze();
    expect(p.processSync(html).contents).toBe(expectedOutput);
});
