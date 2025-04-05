"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Html = void 0;
const token_1 = require("../lexer/token");
class Html {
    constructor(options = {}) {
        this.options = options;
        this.name = 'HtmlExtension';
        this.handlers = this._createHandlers();
    }
    init(parser) {
        // Nothing to initialize
    }
    beforeProcess(context) {
        context.result = '';
        context.htmlStack = [];
    }
    afterProcess(context) {
        // Cleanup any unclosed tags if needed
    }
    _createHandlers() {
        return {
            [token_1.TokenType.HEADING]: (token, context) => {
                context.result += `<h${token.level}>${this._processInlineTokens(token.content)}</h${token.level}>`;
            },
            [token_1.TokenType.PARAGRAPH]: (token, context) => {
                context.result += `<p>${this._processInlineTokens(token.content)}</p>`;
            },
            [token_1.TokenType.CODE_BLOCK]: (token, context) => {
                console.log(token);
                const lang = token.language ? ` class="language-${this._escapeHTML(token.language)}"` : '';
                context.result += `<pre>\n<code${lang}>\n${this._escapeHTML(token.content)}\n</code>\n</pre>`;
            },
            [token_1.TokenType.BLOCKQUOTE]: (token, context) => {
                context.result += `<blockquote>${this._processInlineTokens(token.content)}</blockquote>`;
            },
            [token_1.TokenType.HORIZONTAL_RULE]: (token, context) => {
                context.result += '<hr />';
            },
            [token_1.TokenType.LIST_START]: (token, context) => {
                context.result += `<${token.listType}>`;
            },
            [token_1.TokenType.UNORDERED_LIST_ITEM]: (token, context) => {
                context.result += `<li>${this._processInlineTokens(token.content)}</li>`;
            },
            [token_1.TokenType.ORDERED_LIST_ITEM]: (token, context) => {
                context.result += `<li>${this._processInlineTokens(token.content)}</li>`;
            },
            [token_1.TokenType.LIST_END]: (token, context) => {
                context.result += `</${token.listType}>`;
            }
        };
    }
    _processInlineTokens(tokens) {
        if (!tokens || !Array.isArray(tokens)) {
            return '';
        }
        return tokens.map(token => {
            switch (token.type) {
                case token_1.TokenType.BOLD:
                    return `<strong>${this._processInlineTokens(token.content)}</strong>`;
                case token_1.TokenType.ITALIC:
                    return `<em>${this._processInlineTokens(token.content)}</em>`;
                case token_1.TokenType.CODE_INLINE:
                    return `<code>${this._escapeHTML(token.content)}</code>`;
                case token_1.TokenType.LINK:
                    return `<a href="${this._escapeHTML(token.url)}">${this._escapeHTML(token.text)}</a>`;
                case token_1.TokenType.IMAGE:
                    return `<img src="${this._escapeHTML(token.url)}" alt="${this._escapeHTML(token.alt)}" />`;
                case token_1.TokenType.TEXT:
                    return this._escapeHTML(token.content);
                default:
                    return '';
            }
        }).join('');
    }
    _escapeHTML(text) {
        if (!text)
            return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
exports.Html = Html;
