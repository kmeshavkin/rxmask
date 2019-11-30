interface InputOptions {
    mask?: string;
    placeholderSymbol?: string;
    rxmask?: string;
    value?: string;
    cursorPos?: number;
    allowedCharacters?: string;
    showMask?: number;
    trailing?: boolean;
}
interface Options {
    mask: string;
    placeholderSymbol: string;
    rxmask: string[];
    value: string;
    cursorPos: number;
    allowedCharacters: string;
    showMask: number;
    trailing: boolean;
}
export default class Parser {
    options: Options;
    input: HTMLTextAreaElement | undefined;
    private _output;
    private _prevValue;
    private _isRemovingSymbols;
    private _actualCursorPos;
    private _finalCursorPos;
    constructor(options?: InputOptions, input?: HTMLTextAreaElement);
    readonly output: string;
    readonly finalCursorPos: number;
    setOptions({ mask, placeholderSymbol, rxmask, allowedCharacters, showMask, trailing, value, cursorPos }: InputOptions): void;
    onInput(): void;
    parseMask(): void;
    private parseOutMask;
    private parseRxmask;
    private getOutput;
    strToRxmask(str: string | null | undefined): RegExpMatchArray;
    parseNull(val: any): any;
}
export {};
