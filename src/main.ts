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
    const res = md_render(`
\`\`\`run:js tools=gmail,openai
fun main() {

}
`, new Html());

    console.log(res)
}