export default class Parser {
    constructor() {
        this.mask = '';
        this.placeholderSymbol = '';
        this.rxmask = [];
        this.allowedCharacters = '.';
        this.showMask = 0;
        this.value = '';
        this.cursorPos = 0;
        // Private properties
        this._output = '';
        this._prevValue = '';
        this._diff = 0;
    }
    get output() {
        return this._output;
    }
    parseMask() {
        if (this.rxmask.length === 0) {
            this.rxmask = this.mask.split('').map(char => {
                if (char === this.placeholderSymbol)
                    return '[^]';
                return char;
            });
        }
        const noMaskValue = this.parseOutMask();
        const parsedValue = this.parseAllowedValue(noMaskValue);
        this._output = this.getOutput(parsedValue, this.cursorPos);
        this._prevValue = this._output;
    }
    // Idea here is to parse everything before cursor position as is,
    // but parse everything after cursor as if it was shifted by inserting some symbols on cursor position.
    // This method is trying to remove mask symbols, but it still leaves symbols that are not allowed
    // TODO: Add example
    parseOutMask() {
        // Get length diff between old and current value
        const diff = this.value.length - this._prevValue.length;
        this._diff = diff;
        // Get value before cursor without mask symbols
        let beforeCursor = '';
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i] !== this.rxmask[i] && this.value[i] !== this.placeholderSymbol && i < this.cursorPos) {
                beforeCursor += this.value[i];
            }
        }
        // Get value after cursor without mask symbols
        let afterCursor = '';
        for (let i = 0; i < this.value.length - this.cursorPos; i++) {
            // Diff used here to "shift" mask to position where it supposed to be
            if (this.value[i + this.cursorPos] !== this.rxmask[i + this.cursorPos - diff] &&
                this.value[i + this.cursorPos] !== this.placeholderSymbol) {
                afterCursor += this.value[i + this.cursorPos];
            }
        }
        return beforeCursor + afterCursor;
    }
    parseAllowedValue(noMaskValue) {
        let parsedValue = '';
        const rxmask = this.rxmask.filter(pattern => pattern.match(/\[.*\]/));
        for (let i = 0; i < noMaskValue.length; i++) {
            if (noMaskValue[i].match(this.allowedCharacters) && noMaskValue[i].match(new RegExp(rxmask[i]))) {
                parsedValue += noMaskValue[i];
            }
            else {
                // This line returns cursor to appropriate position according to removed elements
                this.cursorPos--;
                this._diff--;
            }
        }
        return parsedValue;
    }
    getOutput(parsedValue, prevCursorPos) {
        // ! It works, but still unreadable, especially second part. Probably need to separate in two cycles and redo whole second part
        let output = '';
        let hasPlaceholder = false;
        let lastPlaceholderPos = -1;
        for (let i = 0; i < this.rxmask.length; i++) {
            const placeholder = this.rxmask[i].match(/\[.*\]/);
            if (parsedValue.length > 0) {
                if (placeholder) {
                    output += parsedValue[0];
                    parsedValue = parsedValue.slice(1);
                    lastPlaceholderPos = i;
                }
                else {
                    output += this.rxmask[i];
                    // If mask symbol is between initial cursor position and current (increased) cursor position, increase cursorPos
                    if (i < this.cursorPos && i >= prevCursorPos - this._diff)
                        this.cursorPos++;
                }
            }
            else {
                if (this.showMask > i) {
                    if (placeholder) {
                        output += this.placeholderSymbol;
                        hasPlaceholder = true;
                    }
                    else {
                        output += this.rxmask[i];
                    }
                    if (this.cursorPos > i)
                        this.cursorPos = i;
                    if ((this._diff >= 0 || lastPlaceholderPos === -1) && !hasPlaceholder)
                        this.cursorPos++;
                }
                else if (!placeholder && this._diff >= 0 && !hasPlaceholder) {
                    output += this.rxmask[i];
                    if (this.cursorPos > lastPlaceholderPos)
                        this.cursorPos++;
                }
                else {
                    break;
                }
            }
        }
        // ! Old comments, place them where they needed
        // Add mask until its length is this.showMask
        // If showMask is greater than parsed value length, cursor should be moved to the position just next to last symbol from parsedValue
        // This while block causes mask symbols to be added after last character only if user added something
        // Example is if with mask ***--**-** user types 123, user will get 123--, but if he removes symbol 4 from 123--4, he will get just 123 without -
        // Stop user from adding symbols after mask is completed
        if (parsedValue.length > 0) {
            this.cursorPos = prevCursorPos - this._diff;
            return this._prevValue;
        }
        return output;
    }
}
// Currently unused, parses string and escapes any character that is special to RegExp
// function regexLiteral(str: string) {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// }
(function processInputs() {
    const DOMInputs = document.getElementsByClassName('rxmask');
    for (let i = 0; i < DOMInputs.length; i++) {
        const input = DOMInputs[i];
        const parser = new Parser();
        // Call it first time to parse all params and apply visible part of mask
        onInput(input, parser);
        // Add event
        input.oninput = () => onInput(input, parser);
    }
})();
export function onInput(input, parser) {
    // Assign params every time in case it changes on the fly
    parser.mask = input.getAttribute('mask') || '';
    parser.placeholderSymbol = input.getAttribute('placeholderSymbol') || '*';
    parser.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
    parser.allowedCharacters = input.getAttribute('allowedCharacters') || '.';
    parser.showMask = input.getAttribute('showMask') === 'true' ? Infinity : Number(input.getAttribute('showMask'));
    parser.value = input.value;
    parser.cursorPos = input.selectionStart;
    // Call parser
    parser.parseMask();
    // Everything is parsed, set output and cursorPos
    input.value = parser.output;
    input.setSelectionRange(parser.cursorPos, parser.cursorPos);
}
