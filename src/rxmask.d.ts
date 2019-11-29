export default class Parser {
    mask: string;
    placeholderSymbol: string;
    rxmask: string[];
    value: string;
    cursorPos: number;
    allowedCharacters: string;
    showMask: number;
    trailing: boolean;
    private _output;
    private _prevValue;
    private _isRemovingSymbols;
    private _actualCursorPos;
    constructor();
    readonly output: string;
    parseMask(): void;
    parseOutMask(): string;
    parseRxmask([...noMaskValue]: string): string;
    getOutput([...parsedValue]: string): string;
}
export declare function onInput(input: HTMLTextAreaElement, parser: Parser): void;
