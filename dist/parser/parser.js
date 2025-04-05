"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("../lexer/token");
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.extensions = [];
        this.typeHandlers = {};
        this.listContextStack = [];
    }
    use(extension) {
        if (typeof extension !== 'object' || !extension.name) {
            throw new Error('Invalid extension format');
        }
        this.extensions.push(extension);
        if (extension.handlers) {
            Object.keys(extension.handlers).forEach(type => {
                if (!this.typeHandlers[type]) {
                    this.typeHandlers[type] = [];
                }
                this.typeHandlers[type].push(extension.handlers[type]);
            });
        }
        return this;
    }
    parse() {
        this.extensions.forEach(extension => {
            if (typeof extension.init === 'function') {
                extension.init(this);
            }
        });
        const context = {
            parser: this,
            result: null,
            listContextStack: [],
            currentListContext: null
        };
        this.extensions.forEach(extension => {
            if (typeof extension.beforeProcess === 'function') {
                extension.beforeProcess(context, this.tokens);
            }
        });
        this._processTokens(context);
        this.extensions.forEach(extension => {
            if (typeof extension.afterProcess === 'function') {
                extension.afterProcess(context);
            }
        });
        return context;
    }
    _processTokens(context) {
        this.tokens.forEach((token, index) => {
            this._manageListContext(token, index, context);
            const handlers = this.typeHandlers[token.type] || [];
            if (handlers.length > 0) {
                token.index = index;
                token.isFirst = index === 0;
                token.isLast = index === this.tokens.length - 1;
                if (index > 0) {
                    token.previous = this.tokens[index - 1];
                }
                if (index < this.tokens.length - 1) {
                    token.next = this.tokens[index + 1];
                }
                handlers.forEach(handler => {
                    handler(token, context);
                });
            }
        });
    }
    _manageListContext(token, index, context) {
        const isListItem = token.type === token_1.TokenType.UNORDERED_LIST_ITEM ||
            token.type === token_1.TokenType.ORDERED_LIST_ITEM;
        const isOrderedList = token.type === token_1.TokenType.ORDERED_LIST_ITEM;
        if (isListItem) {
            const prevToken = index > 0 ? this.tokens[index - 1] : null;
            const isPrevSameListType = prevToken &&
                ((isOrderedList && prevToken.type === token_1.TokenType.ORDERED_LIST_ITEM) ||
                    (!isOrderedList && prevToken.type === token_1.TokenType.UNORDERED_LIST_ITEM));
            if (!isPrevSameListType) {
                const listContext = {
                    type: isOrderedList ? 'ol' : 'ul',
                    items: [],
                    parent: context.currentListContext
                };
                context.listContextStack.push(listContext);
                context.currentListContext = listContext;
                const listStartHandlers = this.typeHandlers['LIST_START'] || [];
                listStartHandlers.forEach(handler => {
                    handler({ type: token_1.TokenType.LIST_START, listType: listContext.type }, context);
                });
            }
            context.currentListContext.items.push(token);
        }
        else if (context.currentListContext) {
            const nextToken = index < this.tokens.length - 1 ? this.tokens[index + 1] : null;
            const isNextSameListType = nextToken &&
                ((context.currentListContext.type === 'ol' && nextToken.type === token_1.TokenType.ORDERED_LIST_ITEM) ||
                    (context.currentListContext.type === 'ul' && nextToken.type === token_1.TokenType.UNORDERED_LIST_ITEM));
            if (!isNextSameListType && !isListItem) {
                const listEndHandlers = this.typeHandlers['LIST_END'] || [];
                listEndHandlers.forEach(handler => {
                    handler({
                        type: token_1.TokenType.LIST_END,
                        listType: context.currentListContext.type,
                        items: context.currentListContext.items
                    }, context);
                });
                context.listContextStack.pop();
                context.currentListContext = context.listContextStack.length > 0
                    ? context.listContextStack[context.listContextStack.length - 1]
                    : null;
            }
        }
    }
}
exports.Parser = Parser;
