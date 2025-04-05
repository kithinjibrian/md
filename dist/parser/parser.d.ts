import { Token } from "../type";
export type handler = (token: Token, context: Context) => any;
export interface Context {
    parser: Parser;
    result: any;
    listContextStack: any[];
    currentListContext: any;
}
export interface Extension {
    handlers: Record<string, handler>;
    init: Function;
    beforeProcess: Function;
    afterProcess: Function;
}
export declare class Parser {
    private tokens;
    extensions: Extension[];
    typeHandlers: Record<string, handler[]>;
    listContextStack: any[];
    constructor(tokens: Token[]);
    use(extension: any): this;
    parse(): Context;
    _processTokens(context: Context): void;
    _manageListContext(token: Token, index: number, context: Context): void;
}
//# sourceMappingURL=parser.d.ts.map