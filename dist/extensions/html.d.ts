import { Context, Parser, Token, Extension, handler } from "../type";
export interface HtmlContext extends Context {
    htmlStack: any[];
}
export declare class Html implements Extension {
    options: {};
    name: string;
    handlers: Record<any, handler>;
    constructor(options?: {});
    init(parser: Parser): void;
    beforeProcess(context: HtmlContext): void;
    afterProcess(context: HtmlContext): void;
    _createHandlers(): Record<any, handler>;
    _processInlineTokens(tokens: Token[]): string;
    _escapeHTML(text?: string): string;
}
//# sourceMappingURL=html.d.ts.map