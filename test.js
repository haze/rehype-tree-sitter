import { rehypeTreeSitter } from "./index.js";
import { rehype } from "rehype";

test("highlights javascript code", () => {
  const html =
    '<html><head></head><body><pre><code class="language-javascript">function sum(a, b) { return a + b; }</code></pre></body></html>';
  const expectedOutput = `<html><head></head><body><pre><code class="language-javascript"><span class="keyword">function</span> <span class="function">sum</span><span class="punctuation.bracket">(</span><span class="variable.parameter">a</span><span class="punctuation.delimiter">,</span> <span class="variable.parameter">b</span><span class="punctuation.bracket">)</span> <span class="punctuation.bracket">{</span> <span class="keyword">return</span> <span class="variable.parameter">a</span> <span class="operator">+</span> <span class="variable.parameter">b</span><span class="punctuation.delimiter">;</span> <span class="punctuation.bracket">}</span></code></pre></body></html>`;
  const processor = rehype()
    .use(rehypeTreeSitter, { treeSitterGrammarRoot: "./tests" })
    .freeze();
  const output = processor.processSync(html).value;
  expect(output).toBe(expectedOutput);
});
