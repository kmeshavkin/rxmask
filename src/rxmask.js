"use strict";
class Input {
    constructor() {
        this.mask = '';
        this.maskSymbol = '';
        this.value = '';
        this.cursorPos = 0;
        this.output = '';
        this.prevValue = '';
        this.addSymbol = false;
    }
    onChange() {
        // const parsedMask = this.getParsedMask(this.mask, this.maskSymbol);
        const rawValue = this.getRawValue();
        this.output = this.getOutput(rawValue);
        this.prevValue = this.output;
    }
    getRawValue() {
        // Get length diff between old and current value
        const diff = this.value.length - this.prevValue.length;
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
        // console.log('this.addSymbol: ', this.addSymbol);
        return partialOutput + parsedInputAfterCursor;
    }
    // 123
    // cursor after 2
    // paste 123
    // wrong cursor position
    // --- still works wrong
    getOutput(rawValue) {
        let output = '';
        for (let i = 0; i < this.mask.length; i++) {
            if (rawValue.length === 0)
                break;
            if (this.mask[i] === this.maskSymbol) {
                output += rawValue[0];
                rawValue = rawValue.slice(1);
            }
            else if (this.mask[i] === rawValue[0]) {
                output += this.mask[i];
                rawValue = rawValue.slice(1);
            }
            else {
                output += this.mask[i];
            }
        }
        const diff = output.length - this.prevValue.length - 1;
        if (diff > 0)
            this.cursorPos += diff;
        return output;
    }
    getParsedMask(mask, maskSymbol = '*') {
        return mask.replace(new RegExp(this.regexLiteral(maskSymbol), 'g'), '');
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
        input.oninput = () => {
            inputObj.mask = input.getAttribute('mask') || '';
            inputObj.maskSymbol = input.getAttribute('maskSymbol') || '*';
            inputObj.value = input.value;
            inputObj.cursorPos = input.selectionStart;
            inputObj.onChange();
            //
            input.value = inputObj.output;
            input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
        };
    }
})();
