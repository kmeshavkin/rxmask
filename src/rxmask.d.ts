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
    /**
     * Takes options from input (if present) or from provided values, if input and provided value are undefined, do not change value
     * @param {InputOptions} options Options to set
     */
    setOptions({ mask, placeholderSymbol, rxmask, allowedCharacters, showMask, trailing, value, cursorPos }: InputOptions): void;
    /**
     * If this method is called, it will cause options update (with this.input values), call of this.parseMask()
     * and update of new value of this.input (this.input.value) and cursor position (this.input.setSelectionRange)
     * according to changes introduced by this.parseMask()
     */
    onInput(): void;
    /**
     * Call this to update this.output and this.finalCursorPos according to options currently provided in this.options
     */
    parseMask(): void;
    private parseOutMask;
    private parseRxmask;
    private getOutput;
    /**
     * Converts string representation of rxmask to array
     * @param {string | null | undefined} str rxmask string representation or null or undefined
     * @return {string[]} parsed rxmask or empty array
     */
    strToRxmask(str: string | null | undefined): RegExpMatchArray;
    /**
     * Checks if value is null and returns undefined only in that case. Created to correctly parse .getAttribute() from HTMLTextAreaElement
     * @param {any} val Value from input object
     * @return {undefined | any} val or undefined if val is null
     */
    parseNull(val: any): any;
}
export {};
