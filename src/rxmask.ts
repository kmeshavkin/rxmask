export default class Input {
  mask: string;
  symbol: string;
  rxmask: string[];
  value: string;
  cursorPos: number;
  allowedSymbols: string;
  showMask: number;

  private _output: string;
  private _prevValue: string;
  private _diff: number;

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
        if (char === this.symbol) return '[^]';
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
      if (
        this.value[i + this.cursorPos] !== this.rxmask[i + this.cursorPos - diff] &&
        this.value[i + this.cursorPos] !== this.symbol
      ) {
        afterCursor += this.value[i + this.cursorPos];
      }
    }

    return beforeCursor + afterCursor;
  }

  parseAllowedValue(noMaskValue: string) {
    let parsedValue = '';
    const rxmask = this.rxmask.filter(pattern => pattern.match(/\[.*\]/));
    for (let i = 0; i < noMaskValue.length; i++) {
      if (noMaskValue[i].match(this.allowedSymbols) && noMaskValue[i].match(new RegExp(rxmask[i]))) {
        parsedValue += noMaskValue[i];
      } else {
        // This line returns cursor to appropriate position according to removed elements
        this.cursorPos--;
        this._diff--;
      }
    }

    return parsedValue;
  }

  getOutput(parsedValue: string, prevCursorPos: number) {
    let output = '';
    for (let i = 0; i < this.rxmask.length; i++) {
      if (parsedValue.length > 0) {
        if (this.rxmask[i].match(/\[.*\]/)) {
          output += parsedValue[0];
          parsedValue = parsedValue.slice(1);
        } else {
          output += this.rxmask[i];
          // If mask symbol is between initial cursor position and current (increased) cursor position, increase cursorPos
          if (i < this.cursorPos && i >= prevCursorPos - this._diff) this.cursorPos++;
        }
      } else if (this.showMask > i) {
        // Add mask until its length is this.showMask
        output += this.rxmask[i].match(/\[.*\]/) ? this.symbol : this.rxmask[i];
        // If showMask is greater than parsed value length, cursor should be moved to the position just next to last symbol from parsedValue
        if (this.cursorPos >= i) this.cursorPos = i;
      }
    }

    // ! This block incorrectly handles partial this.showMask atm
    // ! Refactor it, condition is unreadable
    // This while block causes mask symbols to be added after last character only if user added something
    // Example is if with mask ***--**-** user types 123, user will get 123--, but if he removes symbol 4 from 123--4, he will get just 123 without -
    while (
      this._diff >= 0 &&
      !output.includes(this.symbol) &&
      this.rxmask[output.length] &&
      !this.rxmask[output.length].match(/\[.*\]/)
    ) {
      output += this.rxmask[output.length];
      if (this.cursorPos === output.length - 1) this.cursorPos++;
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
    const inputInstance = new Input();
    // Call it first time to parse all params and apply visible part of mask
    onInput(input, inputInstance);
    // Add event
    input.oninput = () => onInput(input, inputInstance);
  }
})();

export function onInput(input: HTMLTextAreaElement, inputInstance: Input) {
  // Assign params every time in case it changes on the fly
  inputInstance.mask = input.getAttribute('mask') || '';
  inputInstance.symbol = input.getAttribute('symbol') || '*';
  inputInstance.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
  inputInstance.allowedSymbols = input.getAttribute('allowedSymbols') || '.';
  inputInstance.showMask =
    input.getAttribute('showMask') === 'true' ? Infinity : Number(input.getAttribute('showMask'));
  inputInstance.value = input.value;
  inputInstance.cursorPos = input.selectionStart;
  // Call parser
  inputInstance.parseMask();
  // Everything is parsed, set output and cursorPos
  input.value = inputInstance.output;
  input.setSelectionRange(inputInstance.cursorPos, inputInstance.cursorPos);
}
