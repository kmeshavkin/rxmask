(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rxmask"] = factory();
	else
		root["rxmask"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Parser)
/* harmony export */ });
class Parser {
    constructor(options = {}, input) {
        this.options = {
            mask: '',
            placeholderSymbol: '*',
            rxmask: [],
            value: '',
            cursorPos: 0,
            allowedCharacters: '.',
            maxMaskLength: 0,
            trailing: true
        };
        this.errors = [];
        this._output = '';
        this._parsedValue = '';
        this._prevValue = '';
        this._isRemovingSymbols = false;
        this._actualCursorPos = 0;
        this._finalCursorPos = 0;
        this.input = input;
        this.setOptions(options);
        if (this.input) {
            this.onInput();
        }
        else {
            this.parseMask();
        }
    }
    get output() {
        return this._output;
    }
    get parsedValue() {
        return this._parsedValue;
    }
    get finalCursorPos() {
        return this._finalCursorPos;
    }
    /**
     * Takes options from provided option values
     * @param {InputOptions} options Options to set
     */
    setOptions({ mask = '', placeholderSymbol = '*', rxmask = '', allowedCharacters = '.', maxMaskLength = '0', trailing = 'true', value = '', cursorPos = -1 }) {
        this.options.mask = mask;
        this.options.placeholderSymbol = placeholderSymbol;
        this.options.rxmask = this.strToRxmask(rxmask);
        this.options.allowedCharacters = allowedCharacters;
        this.options.maxMaskLength = Number(maxMaskLength);
        this.options.trailing = trailing === 'true';
        this.options.value = value;
        this.options.cursorPos = cursorPos;
        // Parse rxmask in the end
        if (this.options.rxmask.length === 0) {
            this.options.rxmask = this.options.mask.split('').map(char => {
                if (char === this.options.placeholderSymbol)
                    return '[^]';
                return char;
            });
        }
    }
    /**
     * Takes options from provided input value (if present), otherwise sets previous values
     */
    parseOptionsFromInput() {
        if (this.input) {
            const data = this.input.dataset;
            this.options.mask = data.mask || this.options.mask;
            this.options.placeholderSymbol = data.placeholdersymbol || this.options.placeholderSymbol;
            this.options.rxmask = data.rxmask ? this.strToRxmask(data.rxmask) : this.options.rxmask;
            this.options.allowedCharacters = data.allowedcharacters || this.options.allowedCharacters;
            this.options.maxMaskLength =
                data.maxmasklength !== undefined ? Number(data.maxmasklength) : this.options.maxMaskLength;
            this.options.trailing = data.trailing !== undefined ? data.trailing === 'true' : this.options.trailing;
            this.options.value = this.input.value;
            this.options.cursorPos = this.input.selectionStart || 0;
            // Parse rxmask in the end
            if (this.options.rxmask.length === 0) {
                this.options.rxmask = this.options.mask.split('').map(char => {
                    if (char === this.options.placeholderSymbol)
                        return '[^]';
                    return char;
                });
            }
        }
    }
    /**
     * If this method is called, it will cause options update (with this.input values), call of this.parseMask()
     * and update of new value of this.input (this.input.value) and cursor position (this.input.setSelectionRange)
     * according to changes introduced by this.parseMask()
     */
    onInput() {
        // Set options - in that case it will take all possible options from input element
        this.parseOptionsFromInput();
        // Parse values
        this.parseMask();
        // Everything is parsed, set output and cursorPos
        if (this.input) {
            this.input.value = this.output;
            this.input.setSelectionRange(this.finalCursorPos, this.finalCursorPos);
        }
    }
    /**
     * Call this to update this.output and this.finalCursorPos according to options currently provided in this.options
     */
    parseMask() {
        this.errors = [];
        const noMaskValue = this.parseOutMask();
        const parsedValue = this.parseRxmask(noMaskValue);
        this._parsedValue = parsedValue;
        this._output = this.getOutput(parsedValue);
        this._prevValue = this._output;
    }
    // Idea here is to parse everything before cursor position as is,
    // but parse everything after cursor as if it was shifted by inserting some symbols on cursor position.
    // This method is trying to remove mask symbols, but it still leaves symbols that are not allowed
    // Example ("|" is a cursor position):
    // Mask is ***-**-** and value before input is 123-4|5-6, then user enters 7, so input is initially (before parsing) is 123-47|5-6
    // 123-47 parsed as-is (without shift or diff), so output for beforeCursor is 12347
    // Position of 5-6 is correlates to -** (or, with beforeCursor part ...-..5-6 is correlates to ***-**-**) for mask,
    // so if it will be parsed without shift, it will result in wrong value (-6)
    // Because of that this value is shifted back for one symbol (for as much symbols as were entered or deleted by user) for mask,
    // so 5-6 is now correlates to *-* (or, with beforeCursor part ...-.5-6. is correlates to ***-**-**). Now afterCursor is parsed correctly as 56.
    parseOutMask() {
        const { value, cursorPos, rxmask, placeholderSymbol, allowedCharacters } = this.options;
        // Get length diff between old and current value
        const diff = value.length - this._prevValue.length;
        this._isRemovingSymbols = diff >= 0 ? false : true;
        let parsedAllowedCharacters = /./;
        try {
            parsedAllowedCharacters = new RegExp(allowedCharacters);
        }
        catch (error) {
            console.error('Wrong regex for allowedCharacters!');
        }
        // Get value after cursor without mask symbols
        let afterCursor = '';
        for (let i = cursorPos; i < value.length; i++) {
            // Diff used here to "shift" mask to position where it supposed to be
            if (value[i] !== rxmask[i - diff] && value[i] !== placeholderSymbol && value[i].match(parsedAllowedCharacters)) {
                afterCursor += value[i];
            }
        }
        // Get value before cursor without mask symbols
        let beforeCursor = '';
        for (let i = 0; i < cursorPos; i++) {
            if (value[i] !== rxmask[i]) {
                if (value[i] !== placeholderSymbol && value[i].match(parsedAllowedCharacters)) {
                    // If parsed value length before cursor so far less than
                    // amount of allowed symbols in rxmask minus parsed value length after cursor, add symbol
                    if (beforeCursor.length < rxmask.filter(pattern => pattern.match(/\[.*\]/)).length - afterCursor.length) {
                        beforeCursor += value[i];
                    }
                    else {
                        this.errors.push({ symbol: value[i], position: i, type: 'length' });
                    }
                }
                else if (value[i] !== placeholderSymbol && !value[i].match(parsedAllowedCharacters)) {
                    this.errors.push({ symbol: value[i], position: i, type: 'allowedCharacters' });
                }
            }
        }
        this._actualCursorPos = beforeCursor.length; // it holds position of cursor after input was parsed
        return beforeCursor + afterCursor;
    }
    parseRxmask([...noMaskValue]) {
        const { rxmask } = this.options;
        let parsedValue = '';
        const filteredRxmask = rxmask.filter(pattern => pattern.match(/\[.*\]/));
        let correctCount = 0;
        let incorrectCount = 0;
        while (noMaskValue.length > 0 && correctCount < noMaskValue.length) {
            let regexChar = /./;
            try {
                regexChar = new RegExp(filteredRxmask[correctCount]);
            }
            catch (error) {
                console.error('Wrong regex for rxmask!');
            }
            if (noMaskValue[correctCount].match(regexChar)) {
                parsedValue += noMaskValue[correctCount];
                correctCount++;
            }
            else {
                this.errors.push({
                    symbol: noMaskValue[correctCount],
                    position: correctCount + incorrectCount,
                    type: 'rxmask'
                });
                noMaskValue.shift();
                incorrectCount++;
                // This line returns cursor to appropriate position according to removed elements
                if (this._actualCursorPos > correctCount)
                    this._actualCursorPos--;
            }
        }
        return parsedValue;
    }
    getOutput([...parsedValue]) {
        const { rxmask, maxMaskLength, placeholderSymbol, trailing } = this.options;
        this._finalCursorPos = 0; // Reset value
        let output = '';
        const parsedValueEmpty = parsedValue.length === 0;
        const isMaskFilled = rxmask.filter(pattern => pattern.match(/\[.*\]/)).length === parsedValue.length;
        let encounteredPlaceholder = false; // stores if loop found a placeholder at least once
        for (let i = 0; i < rxmask.length; i++) {
            // This condition checks if placeholder was found
            if (rxmask[i].match(/\[.*\]/)) {
                if (parsedValue.length > 0) {
                    output += parsedValue.shift();
                }
                else if (maxMaskLength > i) {
                    output += placeholderSymbol;
                    encounteredPlaceholder = true;
                }
                else {
                    break;
                }
                if (this._actualCursorPos > 0)
                    this._finalCursorPos++;
                this._actualCursorPos--; // reduce this because one symbol or placeholder was added
            }
            else {
                // Add mask symbol if
                if (
                // mask is not fully shown according to this.maxMaskLength
                maxMaskLength > i ||
                    // OR there's some parsed characters left to add
                    parsedValue.length > 0 ||
                    // OR this mask symbol is following parsedValue character AND user just added symbols (not removed)
                    // AND (trailing should be enabled OR mask is filled, then add trailing symbols anyway) - see example in README under `trailing` option
                    ((trailing || isMaskFilled) && !encounteredPlaceholder && !this._isRemovingSymbols)) {
                    output += rxmask[i];
                }
                else {
                    break;
                }
                // Add 1 to cursorPos if
                if (
                // no placeholder was encountered AND parsedValue is empty AND this mask symbol should be shown
                // (this ensures that cursor position will be always set just before first placeholder if parsedValue is empty)
                (!encounteredPlaceholder && parsedValueEmpty && maxMaskLength > i) ||
                    // OR according to _actualCursorPos not all characters from parsedValue before cursorPos were added yet
                    this._actualCursorPos > 0 ||
                    // OR all characters from parsedValue before cursorPos were added AND no placeholders yet (or _actualCursorPos will be negative)
                    // AND user just added symbols (see example in README under `trailing` option)
                    (trailing && this._actualCursorPos === 0 && !this._isRemovingSymbols)) {
                    this._finalCursorPos++;
                }
            }
        }
        return output;
    }
    /**
     * Converts string representation of rxmask to array
     * @param {string | null | undefined} str rxmask string representation or null or undefined
     * @return {string[]} parsed rxmask or empty array
     */
    strToRxmask(str) {
        return (str || '').match(/(\[.*?\])|(.)/g) || [];
    }
}
(function processInputs() {
    const DOMInputs = document.getElementsByClassName('rxmask');
    for (let i = 0; i < DOMInputs.length; i++) {
        const input = DOMInputs[i];
        const parser = new Parser({}, input);
        // Add event
        input.oninput = () => parser.onInput();
    }
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});