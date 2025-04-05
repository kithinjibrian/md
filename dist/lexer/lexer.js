"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
class Lexer {
    constructor(input) {
        this.input = input;
    }
    tokenize() {
        const lines = this.input.split('\n');
        const tokens = [];
        let inCodeBlock = false;
        let codeBlockContent = '';
        let codeBlockLanguage = '';
        let codeBlockContext = [];
        let runImmediately = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            // Handle code blocks
            if (trimmedLine.startsWith('```')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeBlockContent = '';
                    codeBlockLanguage = '';
                    codeBlockContext = [];
                    runImmediately = false;
                    const langDirective = trimmedLine.slice(3).trim();
                    if (langDirective.startsWith('run:')) {
                        runImmediately = true;
                        const [langPart, ...rest] = langDirective.slice(4).trim().split(/\s+/);
                        codeBlockLanguage = langPart;
                        for (const part of rest) {
                            if (part.startsWith('tools=')) {
                                const value = part.slice(6);
                                codeBlockContext = value.split(',').map(c => c.trim()).filter(Boolean);
                            }
                        }
                    }
                    else {
                        codeBlockLanguage = langDirective;
                    }
                }
                else {
                    tokens.push({
                        type: token_1.TokenType.CODE_BLOCK,
                        content: codeBlockContent,
                        language: codeBlockLanguage,
                        run: runImmediately,
                        context: codeBlockContext
                    });
                    inCodeBlock = false;
                }
                continue;
            }
            if (inCodeBlock) {
                codeBlockContent += line + '\n';
                continue;
            }
            // Horizontal rules
            if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
                tokens.push({ type: token_1.TokenType.HORIZONTAL_RULE });
                continue;
            }
            // Headings
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                tokens.push({
                    type: token_1.TokenType.HEADING,
                    level: headingMatch[1].length,
                    content: this.tokenizeInline(headingMatch[2])
                });
                continue;
            }
            // Blockquotes
            if (trimmedLine.startsWith('> ')) {
                tokens.push({
                    type: token_1.TokenType.BLOCKQUOTE,
                    content: this.tokenizeInline(trimmedLine.slice(2))
                });
                continue;
            }
            // Unordered list
            if (trimmedLine.match(/^[*\-+]\s+/)) {
                tokens.push({
                    type: token_1.TokenType.UNORDERED_LIST_ITEM,
                    content: this.tokenizeInline(trimmedLine.slice(2))
                });
                continue;
            }
            // Ordered list
            const orderedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
            if (orderedListMatch) {
                tokens.push({
                    type: token_1.TokenType.ORDERED_LIST_ITEM,
                    number: parseInt(orderedListMatch[1]),
                    content: this.tokenizeInline(orderedListMatch[2])
                });
                continue;
            }
            // Empty line
            if (trimmedLine === '') {
                tokens.push({ type: token_1.TokenType.LINE_BREAK });
                continue;
            }
            // Default to paragraph
            tokens.push({
                type: token_1.TokenType.PARAGRAPH,
                content: this.tokenizeInline(line)
            });
        }
        // EOF closes unclosed code block
        if (inCodeBlock) {
            tokens.push({
                type: token_1.TokenType.CODE_BLOCK,
                content: codeBlockContent,
                language: codeBlockLanguage,
                run: runImmediately,
                context: codeBlockContext
            });
        }
        return tokens;
    }
    tokenizeInline(text) {
        const tokens = [];
        let currentPosition = 0;
        while (currentPosition < text.length) {
            const rest = text.slice(currentPosition);
            // Bold
            const boldMatch = rest.match(/^(\*\*|__)(.*?)\1/);
            if (boldMatch) {
                tokens.push({
                    type: token_1.TokenType.BOLD,
                    content: this.tokenizeInline(boldMatch[2])
                });
                currentPosition += boldMatch[0].length;
                continue;
            }
            // Italic
            const italicMatch = rest.match(/^(\*|_)(.*?)\1/);
            if (italicMatch && !rest.startsWith('**')) {
                tokens.push({
                    type: token_1.TokenType.ITALIC,
                    content: this.tokenizeInline(italicMatch[2])
                });
                currentPosition += italicMatch[0].length;
                continue;
            }
            // Inline code
            const codeInlineMatch = rest.match(/^`(.*?)`/);
            if (codeInlineMatch) {
                tokens.push({
                    type: token_1.TokenType.CODE_INLINE,
                    content: codeInlineMatch[1]
                });
                currentPosition += codeInlineMatch[0].length;
                continue;
            }
            // Links
            const linkMatch = rest.match(/^\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                tokens.push({
                    type: token_1.TokenType.LINK,
                    text: linkMatch[1],
                    url: linkMatch[2]
                });
                currentPosition += linkMatch[0].length;
                continue;
            }
            // Images
            const imageMatch = rest.match(/^!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                tokens.push({
                    type: token_1.TokenType.IMAGE,
                    alt: imageMatch[1],
                    url: imageMatch[2]
                });
                currentPosition += imageMatch[0].length;
                continue;
            }
            // Plain text
            const nextSpecialChar = rest.search(/[\*_`\[]/);
            const textEnd = nextSpecialChar === -1 ? text.length : currentPosition + nextSpecialChar;
            const plainText = text.slice(currentPosition, textEnd);
            if (plainText) {
                tokens.push({
                    type: token_1.TokenType.TEXT,
                    content: plainText
                });
            }
            currentPosition = textEnd === currentPosition ? currentPosition + 1 : textEnd;
        }
        return tokens;
    }
}
exports.Lexer = Lexer;
