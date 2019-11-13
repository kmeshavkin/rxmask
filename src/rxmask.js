"use strict";
class Input {
    constructor() {
        this.mask = '';
        this.symbol = '';
        this.value = '';
        this.output = '';
        this.prevValue = '';
        this.diff = 0;
        this.cursorPos = 0;
        this.allowedSymbols = /./;
        this.showMask = false;
    }
    parseMask() {
        const rawValue = this.getRawValue();
        this.output = this.getOutput(rawValue);
        this.prevValue = this.output;
    }
    getRawValue() {
        // Get length diff between old and current value
        const diff = this.value.length - this.prevValue.length;
        this.diff = diff;
        // Get value before cursor without mask symbols
        let partialOutput = '';
        for (let i = 0; i < this.value.length; i++) {
            if (this.value[i] !== this.mask[i] && i < this.cursorPos) {
                partialOutput += this.value[i];
            }
        }
        // Get value after before cursor
        const inputAfterCursor = this.value.slice(this.cursorPos);
        // Get value after before cursor without mask symbols
        let parsedInputAfterCursor = '';
        for (let i = 0; i < inputAfterCursor.length; i++) {
            if (inputAfterCursor[i] !== this.mask[i + this.cursorPos - diff]) {
                parsedInputAfterCursor += inputAfterCursor[i];
            }
        }
        // console.log('this.cursorPos: ', this.cursorPos);
        // console.log('partialOutput: ', partialOutput);
        // console.log('this.value: ', this.value);
        // console.log('inputAfterCursor: ', inputAfterCursor);
        // console.log('parsedInputAfterCursor: ', parsedInputAfterCursor);
        // console.log('this.prevValue: ', this.prevValue);
        // console.log('diff: ', diff);
        return ((partialOutput + parsedInputAfterCursor).match(this.allowedSymbols) || []).join('');
    }
    // If showMask === true, cursor position is wrong (place cursor in the middle of mask and paste symbols)
    // Place cursor before - in ***-**-**, press delete - nothing happens
    getOutput(rawValue) {
        let output = '';
        const prevCursorPos = this.cursorPos;
        for (let i = 0; i < this.mask.length; i++) {
            if (this.mask[i] === this.symbol) {
                if (rawValue.length === 0) {
                    if (!this.showMask)
                        break;
                    output += this.mask[i];
                }
                else {
                    output += rawValue[0];
                    rawValue = rawValue.slice(1);
                    // This allows to add mask symbol after if user is adding symbols and delete mask symbol if user deletes symbols
                    if (rawValue.length === 0 && this.diff < 0 && !this.showMask)
                        break;
                }
            }
            else {
                output += this.mask[i];
                // If mask symbol is between initial cursor position and current (increased) cursor position, increase cursorPos
                if (i >= prevCursorPos - this.diff && i <= this.cursorPos)
                    this.cursorPos++;
            }
        }
        // Stop user from adding symbols after mask is completed
        if (rawValue.length > 0) {
            this.cursorPos = prevCursorPos - this.diff;
            return this.prevValue;
        }
        return output;
    }
    regexLiteral(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
(function processInputs() {
    const DOMInputs = document.getElementsByClassName('rxmask');
    const inputs = [];
    for (let i = 0; i < DOMInputs.length; i++) {
        const input = DOMInputs[i];
        const inputObj = new Input();
        inputs.push(inputObj);
        onInput(input, inputObj);
        input.oninput = () => onInput(input, inputObj);
    }
})();
function onInput(input, inputObj) {
    inputObj.mask = input.getAttribute('mask') || '';
    inputObj.symbol = input.getAttribute('symbol') || '*';
    inputObj.allowedSymbols = new RegExp(input.getAttribute('allowedSymbols') || '.', 'g');
    inputObj.showMask = Boolean(input.getAttribute('showMask')) || false;
    inputObj.value = input.value;
    inputObj.cursorPos = input.selectionStart;
    inputObj.parseMask();
    //
    input.value = inputObj.output;
    input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
}
