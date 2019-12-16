export interface InputOptions {
    mask?: string;
    placeholderSymbol?: string;
    rxmask?: string;
    value?: string;
    cursorPos?: number;
    allowedCharacters?: string;
    maxMaskLength?: string;
    trailing?: string;
}
export interface Options {
    mask: string;
    placeholderSymbol: string;
    rxmask: string[];
    value: string;
    cursorPos: number;
    allowedCharacters: string;
    maxMaskLength: number;
    trailing: boolean;
}
export default class Parser {
    options: Options;
    input: HTMLTextAreaElement | HTMLInputElement | null | undefined;
    private _output;
    private _prevValue;
    private _isRemovingSymbols;
    private _actualCursorPos;
    private _finalCursorPos;
    constructor(options?: InputOptions, input?: HTMLTextAreaElement | HTMLInputElement | null | undefined);
    get output(): string;
    get finalCursorPos(): number;
    /**
     * Takes options from provided option values
     * @param {InputOptions} options Options to set
     */
    setOptions({ mask, placeholderSymbol, rxmask, allowedCharacters, maxMaskLength, trailing, value, cursorPos }: InputOptions): void;
    /**
     * Takes options from provided input value (if present), otherwise sets previous values
     */
    private parseOptionsFromInput;
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
    private strToRxmask;
}
