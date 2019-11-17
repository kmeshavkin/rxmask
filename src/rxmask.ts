class Input {
  mask: string;
  symbol: string;
  value: string;
  cursorPos: number;
  allowedSymbols: RegExp;
  showMask: boolean;

  private _output: string;
  private _prevValue: string;
  private _diff: number;

  constructor() {
    this.mask = '';
    this.symbol = '';
    this.allowedSymbols = /./;
    this.showMask = false;
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
      if (this.value[i] !== this.mask[i] && i < this.cursorPos) {
        beforeCursor += this.value[i];
      }
    }

    // Get value after cursor without mask symbols
    let afterCursor = '';
    for (let i = 0; i < this.value.length - this.cursorPos; i++) {
      // Diff used here to "shift" mask to position where it supposed to be
      if (this.value[i + this.cursorPos] !== this.mask[i + this.cursorPos - diff]) {
        afterCursor += this.value[i + this.cursorPos];
      }
    }

    return beforeCursor + afterCursor;
  }

  parseAllowedValue(noMaskValue: string) {
    let parsedValue = '';
    for (let i = 0; i < noMaskValue.length; i++) {
      if (noMaskValue[i].match(this.allowedSymbols)) {
        parsedValue += noMaskValue[i];
      } else {
        // This line returns cursor to appropriate position according to removed elements
        this.cursorPos--;
      }
    }

    return parsedValue;
  }

  getOutput(parsedValue: string, prevCursorPos: number) {
    let output = '';
    let movedCursorPos = false;

    for (let i = 0; i < this.mask.length; i++) {
      if (parsedValue.length > 0) {
        if (this.mask[i] === this.symbol) {
          output += parsedValue[0];
          parsedValue = parsedValue.slice(1);
        } else {
          output += this.mask[i];
          // If mask symbol is between initial cursor position and current (increased) cursor position, increase cursorPos
          if (i < this.cursorPos && i >= prevCursorPos - this._diff) this.cursorPos++;
        }
      } else if (this.showMask) {
        output += this.mask[i];
        // If showMask is on, cursor should be moved to the position just next to last symbol from parsedValue
        if (!movedCursorPos && this.cursorPos > i) {
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

function regexLiteral(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

(function processInputs() {
  const DOMInputs = <HTMLCollectionOf<HTMLTextAreaElement>>document.getElementsByClassName('rxmask');
  for (let i = 0; i < DOMInputs.length; i++) {
    const input = DOMInputs[i];
    const inputObj = new Input();
    // Call it first time to parse all params and apply visible part of mask
    onInput(input, inputObj);
    // Add event
    input.oninput = () => onInput(input, inputObj);
  }
})();

function onInput(input: HTMLTextAreaElement, inputObj: Input) {
  // Assign params every time in case it changes on the fly
  inputObj.mask = input.getAttribute('mask') || '';
  inputObj.symbol = input.getAttribute('symbol') || '*';
  inputObj.allowedSymbols = new RegExp(input.getAttribute('allowedSymbols') || '.');
  inputObj.showMask = Boolean(input.getAttribute('showMask')) || false;
  inputObj.value = input.value;
  inputObj.cursorPos = input.selectionStart;
  // Call parser
  inputObj.parseMask();
  // Everything is parsed, set output and cursorPos
  input.value = inputObj.output;
  input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
}
