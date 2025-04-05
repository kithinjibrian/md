import { TokenType } from "../lexer/token";
import { Context, Parser, Token, Extension, handler } from "../type";

export interface HtmlContext extends Context {
    htmlStack: any[]
}

export class Html implements Extension {
    public name = 'HtmlExtension';
    public handlers = this._createHandlers();

    constructor(
        public options = {}
    ) {
    }

    init(parser: Parser) {
        // Nothing to initialize
    }

    beforeProcess(context: HtmlContext) {
        context.result = '';
        context.htmlStack = [];
    }

    afterProcess(context: HtmlContext) {
        // Cleanup any unclosed tags if needed
    }

    _createHandlers(): Record<any, handler> {
        return {
            [TokenType.HEADING]: (token: Token, context: Context) => {
                context.result += `<h${token.level}>${this._processInlineTokens(token.content)}</h${token.level}>`;
            },

            [TokenType.PARAGRAPH]: (token: Token, context: Context) => {
                context.result += `<p>${this._processInlineTokens(token.content)}</p>`;
            },

            [TokenType.CODE_BLOCK]: (token: Token, context: Context) => {
                const lang = token.language ? ` class="language-${this._escapeHTML(token.language)}"` : '';
                context.result += `<pre>\n<code${lang}>\n${this._escapeHTML(token.content)}\n</code>\n</pre>`;
            },

            [TokenType.BLOCKQUOTE]: (token: Token, context: Context) => {
                context.result += `<blockquote>${this._processInlineTokens(token.content)}</blockquote>`;
            },

            [TokenType.HORIZONTAL_RULE]: (token: Token, context: Context) => {
                context.result += '<hr />';
            },

            [TokenType.LIST_START]: (token: Token, context: Context) => {
                context.result += `<${token.listType}>`;
            },

            [TokenType.UNORDERED_LIST_ITEM]: (token: Token, context: Context) => {
                context.result += `<li>${this._processInlineTokens(token.content)}</li>`;
            },

            [TokenType.ORDERED_LIST_ITEM]: (token: Token, context: Context) => {
                context.result += `<li>${this._processInlineTokens(token.content)}</li>`;
            },

            [TokenType.LIST_END]: (token: Token, context: Context) => {
                context.result += `</${token.listType}>`;
            }
        };
    }

    _processInlineTokens(tokens: Token[]): string {
        if (!tokens || !Array.isArray(tokens)) {
            return '';
        }

        return tokens.map(token => {
            switch (token.type) {
                case TokenType.BOLD:
                    return `<strong>${this._processInlineTokens(token.content)}</strong>`;

                case TokenType.ITALIC:
                    return `<em>${this._processInlineTokens(token.content)}</em>`;

                case TokenType.CODE_INLINE:
                    return `<code>${this._escapeHTML(token.content)}</code>`;

                case TokenType.LINK:
                    return `<a href="${this._escapeHTML(token.url)}">${this._escapeHTML(token.text)}</a>`;

                case TokenType.IMAGE:
                    return `<img src="${this._escapeHTML(token.url)}" alt="${this._escapeHTML(token.alt)}" />`;

                case TokenType.TEXT:
                    return this._escapeHTML(token.content);

                default:
                    return '';
            }
        }).join('');
    }

    _escapeHTML(text?: string) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}