"use strict";
class Input {
    constructor() {
        this.mask = '';
        this.symbol = '';
        this.rxmask = [];
        this.allowedSymbols = '.';
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
                if (char === this.symbol)
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
            if (this.value[i] !== this.rxmask[i] && this.value[i] !== this.symbol && i < this.cursorPos) {
                beforeCursor += this.value[i];
            }
        }
        // Get value after cursor without mask symbols
        let afterCursor = '';
        for (let i = 0; i < this.value.length - this.cursorPos; i++) {
            // Diff used here to "shift" mask to position where it supposed to be
            if (this.value[i + this.cursorPos] !== this.rxmask[i + this.cursorPos - diff] &&
                this.value[i + this.cursorPos] !== this.symbol) {
                afterCursor += this.value[i + this.cursorPos];
            }
        }
        return beforeCursor + afterCursor;
    }
    parseAllowedValue(noMaskValue) {
        let parsedValue = '';
        const rxmask = this.rxmask.filter(pattern => pattern.match(/\[.*\]/));
        for (let i = 0; i < noMaskValue.length; i++) {
            if (noMaskValue[i].match(this.allowedSymbols) && noMaskValue[i].match(new RegExp(rxmask[i]))) {
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
        let output = '';
        let movedCursorPos = false;
        for (let i = 0; i < this.rxmask.length; i++) {
            if (parsedValue.length > 0) {
                if (this.rxmask[i].match(/\[.*\]/)) {
                    output += parsedValue[0];
                    parsedValue = parsedValue.slice(1);
                }
                else {
                    output += this.rxmask[i];
                    // If mask symbol is between initial cursor position and current (increased) cursor position, increase cursorPos
                    if (i < this.cursorPos && i >= prevCursorPos - this._diff)
                        this.cursorPos++;
                }
            }
            else if (this.showMask > i) {
                output += this.rxmask[i].match(/\[.*\]/) ? this.symbol : this.rxmask[i];
                // If showMask is greater than parsed value length, cursor should be moved to the position just next to last symbol from parsedValue
                if (!movedCursorPos && this.cursorPos > i && this._diff > 0) {
                    this.cursorPos = i;
                    movedCursorPos = true;
                }
            }
        }
        // Stop user from adding symbols after mask is completed
        if (parsedValue.length > 0) {
            this.cursorPos = prevCursorPos - this._diff;
            return this._prevValue;
        }
        return output;
    }
}
function regexLiteral(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
(function processInputs() {
    const DOMInputs = document.getElementsByClassName('rxmask');
    for (let i = 0; i < DOMInputs.length; i++) {
        const input = DOMInputs[i];
        const inputObj = new Input();
        // Call it first time to parse all params and apply visible part of mask
        onInput(input, inputObj);
        // Add event
        input.oninput = () => onInput(input, inputObj);
    }
})();
function onInput(input, inputObj) {
    // Assign params every time in case it changes on the fly
    inputObj.mask = input.getAttribute('mask') || '';
    inputObj.symbol = input.getAttribute('symbol') || '*';
    inputObj.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
    inputObj.allowedSymbols = input.getAttribute('allowedSymbols') || '.';
    inputObj.showMask = input.getAttribute('showMask') === "true" ? Infinity : Number(input.getAttribute('showMask'));
    inputObj.value = input.value;
    inputObj.cursorPos = input.selectionStart;
    // Call parser
    inputObj.parseMask();
    // Everything is parsed, set output and cursorPos
    input.value = inputObj.output;
    input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
}
