import { TokenType } from "./token";
export interface Token {
    type: TokenType;
    number?: number;
    level?: number;
    content?: any;
    language?: string;
    index?: number;
    isFirst?: boolean;
    isLast?: boolean;
    previous?: Token;
    next?: Token;
    listType?: string;
    items?: any;
    url?: string;
    text?: string;
    alt?: string;
    run?: boolean;
    context?: string[];
}
export declare class Lexer {
    private input;
    constructor(input: string);
    tokenize(): Token[];
    tokenizeInline(text: string): any;
}
//# sourceMappingURL=lexer.d.ts.map