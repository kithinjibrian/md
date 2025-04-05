# Transform markdown to HTML or react

# Installation

```bash
npm install @kithinji/md
```

# Example

```ts
import { md_render, Html } from "@kithinji/md";

let md = `
# Hello world in lugha

\`\`\`lugha
use std::io::{ print };

fun main(): unit {
    print("{}", "Hello, World!");
}
\`\`\`
`

const context = md_render(md, new Html());

console.log(context.result);
```

Output

```html
<h1>Hello world in lugha</h1><pre>
<code class="language-lugha">
use std::io::{ print };

fun main(): unit {
    print(&quot;{}&quot;, &quot;Hello, World!&quot;);
}

</code>
</pre>
```