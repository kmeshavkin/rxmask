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
        const rawValue = this.getRawValue(this.value, this.mask, this.cursorPos, this.prevValue);
        this.output = this.getOutput(rawValue, this.mask, this.maskSymbol);
        this.prevValue = this.output;
    }
    getRawValue(inputValue, mask, cursorPos, prevValue) {
        // Get length diff between old and current value
        const diff = inputValue.length - prevValue.length;
        // Get value before cursor without mask symbols
        let partialOutput = '';
        for (let i = 0; i < inputValue.length; i++) {
            if (inputValue[i] !== mask[i]) {
                if (i < cursorPos)
                    partialOutput += inputValue[i];
            }
            else if (i === inputValue.length - 1) {
                this.addSymbol = true;
            }
        }
        // Get value after before cursor
        const inputAfterCursor = inputValue.slice(cursorPos);
        // Get value after before cursor without mask symbols
        let parsedInputAfterCursor = '';
        for (let i = 0; i < inputAfterCursor.length; i++) {
            if (inputAfterCursor[i] !== mask[i + cursorPos - diff]) {
                parsedInputAfterCursor += inputAfterCursor[i];
            }
        }
        console.log('cursorPos: ', cursorPos);
        console.log('partialOutput: ', partialOutput);
        console.log('inputValue: ', inputValue);
        console.log('inputAfterCursor: ', inputAfterCursor);
        console.log('parsedInputAfterCursor: ', parsedInputAfterCursor);
        console.log('prevValue: ', prevValue);
        console.log('diff: ', diff);
        console.log('this.addSymbol: ', this.addSymbol);
        return partialOutput + parsedInputAfterCursor;
    }
    // paste 12-3-456- - still weird
    // 123-45-6
    // cursor after 5
    // add symbol
    // wrong cursor position (this.cursorPos++ causes this)
    // implement addSymbol for case like this: mask: ***-**-**, input: ---, add another -, should become -----
    getOutput(rawValue, mask, maskSymbol) {
        let output = '';
        for (let i = 0; i < mask.length; i++) {
            if (rawValue.length === 0)
                break;
            if (mask[i] === maskSymbol) {
                output += rawValue[0];
                rawValue = rawValue.slice(1);
            }
            else if (mask[i] === rawValue[0]) {
                output += mask[i];
                rawValue = rawValue.slice(1);
            }
            else {
                output += mask[i];
                this.cursorPos++;
            }
        }
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
