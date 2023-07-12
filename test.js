import { rehypeTreeSitter } from './index.js';
import { rehype } from 'rehype';

test('highlights javascript code', () => {
    const html = '<html><head></head><body><pre><code class="language-javascript">function sum(a, b) { return a + b; }</code></pre></body></html>'
    const expectedOutput = `<html><head></head><body><pre><code class="language-javascript"><table>
<tbody><tr><td class="line-number">1</td><td class="line"><span style="color: #5f00d7">function</span> <span style="color: #005fd7">sum</span><span style="color: #4e4e4e">(</span><span style="text-decoration: underline;">a</span><span style="color: #4e4e4e">,</span> <span style="text-decoration: underline;">b</span><span style="color: #4e4e4e">)</span> <span style="color: #4e4e4e">{</span> <span style="color: #5f00d7">return</span> <span style="text-decoration: underline;">a</span> <span style="font-weight: bold;color: #4e4e4e">+</span> <span style="text-decoration: underline;">b</span><span style="color: #4e4e4e">;</span> <span style="color: #4e4e4e">}</span>
</td></tr>
</tbody></table></code></pre></body></html>`
    const processor = rehype().use(rehypeTreeSitter).freeze();
    const output = processor.processSync(html).value;
    expect(output).toBe(expectedOutput);
});
