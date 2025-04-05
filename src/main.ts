import { Extension, Html, Lexer, Parser } from "./type";

export * from "./type"

export function md_render(markdown: string, extension: Extension) {
    const lexer = new Lexer(markdown);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    parser.use(extension)

    return parser.parse()
}

if (require.main === module) {
    const context = md_render(`
# Hello world in lugha

\`\`\`lugha
use std::io::{ print };

fun main(): unit {
    print("{}", "Hello, World!");
}
\`\`\`
`, new Html());

    console.log(context.result)
}