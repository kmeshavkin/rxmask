export default class Parser {
  mask: string;
  placeholderSymbol: string;
  rxmask: string[];
  value: string;
  cursorPos: number;
  allowedCharacters: string;
  showMask: number;
  trailing: boolean;

  private _output: string;
  private _prevValue: string;
  private _isRemovingSymbols: boolean;
  private _actualCursorPos: number;

  constructor() {
    this.mask = '';
    this.placeholderSymbol = '';
    this.rxmask = [];
    this.allowedCharacters = '.';
    this.showMask = 0;
    this.trailing = true;
    this.value = '';
    this.cursorPos = 0;
    // Private properties
    this._output = '';
    this._prevValue = '';
    this._isRemovingSymbols = false;
    this._actualCursorPos = 0;
  }

  get output() {
    return this._output;
  }

  parseMask() {
    if (this.rxmask.length === 0) {
      this.rxmask = this.mask.split('').map(char => {
        if (char === this.placeholderSymbol) return '[^]';
        return char;
      });
    }
    const noMaskValue = this.parseOutMask();
    const parsedValue = this.parseRxmask(noMaskValue);
    this._output = this.getOutput(parsedValue);
    this._prevValue = this._output;
  }

  // Idea here is to parse everything before cursor position as is,
  // but parse everything after cursor as if it was shifted by inserting some symbols on cursor position.
  // This method is trying to remove mask symbols, but it still leaves symbols that are not allowed
  // TODO: Add example
  parseOutMask() {
    // Get length diff between old and current value
    const diff = this.value.length - this._prevValue.length;
    this._isRemovingSymbols = diff >= 0 ? false : true;

    // Get value after cursor without mask symbols
    let afterCursor = '';
    for (let i = this.cursorPos; i < this.value.length; i++) {
      // Diff used here to "shift" mask to position where it supposed to be
      if (
        this.value[i] !== this.rxmask[i - diff] &&
        this.value[i] !== this.placeholderSymbol &&
        this.value[i].match(this.allowedCharacters)
      ) {
        afterCursor += this.value[i];
      }
    }

    // Get value before cursor without mask symbols
    let beforeCursor = '';
    for (let i = 0; i < this.cursorPos; i++) {
      if (
        this.value[i] !== this.rxmask[i] &&
        this.value[i] !== this.placeholderSymbol &&
        this.value[i].match(this.allowedCharacters)
      ) {
        // If parsed value length before cursor so far less than
        // amount of allowed symbols in rxmask minus parsed value length after cursor, add symbol
        if (beforeCursor.length < this.rxmask.filter(pattern => pattern.match(/\[.*\]/)).length - afterCursor.length)
          beforeCursor += this.value[i];
      }
    }

    this._actualCursorPos = beforeCursor.length; // it holds position of cursor after input was parsed
    return beforeCursor + afterCursor;
  }

  parseRxmask([...noMaskValue]: string) {
    let parsedValue = '';
    const rxmask = this.rxmask.filter(pattern => pattern.match(/\[.*\]/));
    let i = 0;
    while (noMaskValue.length > 0 && i < noMaskValue.length) {
      if (noMaskValue[i].match(new RegExp(rxmask[i]))) {
        parsedValue += noMaskValue[i];
        i++;
      } else {
        noMaskValue.shift();
        // This line returns cursor to appropriate position according to removed elements
        if (this._actualCursorPos > i) this._actualCursorPos--;
      }
    }

    return parsedValue;
  }

  getOutput([...parsedValue]: string) {
    this.cursorPos = 0; // We don't need initial cursorPos anymore
    let output = '';
    const parsedValueEmpty = parsedValue.length === 0;
    const isMaskFilled = this.rxmask.filter(pattern => pattern.match(/\[.*\]/)).length === parsedValue.length;
    let encounteredPlaceholder = false; // stores if loop found a placeholder at least once
    for (let i = 0; i < this.rxmask.length; i++) {
      // This condition checks if placeholder was found
      if (this.rxmask[i].match(/\[.*\]/)) {
        if (parsedValue.length > 0) {
          output += parsedValue.shift();
        } else if (this.showMask > i) {
          output += this.placeholderSymbol;
          encounteredPlaceholder = true;
        } else {
          break;
        }
        if (this._actualCursorPos > 0) this.cursorPos++;
        this._actualCursorPos--; // reduce this because one symbol or placeholder was added
      } else {
        // Add mask symbol if
        if (
          // mask is not fully shown according to this.showMask
          this.showMask > i ||
          // OR there's some parsed characters left to add
          parsedValue.length > 0 ||
          // OR this mask symbol is following parsedValue character AND user just added symbols (not removed)
          // AND (trailing should be enabled OR mask is filled, then add trailing symbols anyway) - see example in README under `trailing` option
          ((this.trailing || isMaskFilled) && !encounteredPlaceholder && !this._isRemovingSymbols)
        ) {
          output += this.rxmask[i];
        } else {
          break;
        }
        // Add 1 to cursorPos if
        if (
          // no placeholder was encountered AND parsedValue is empty AND this mask symbol should be shown
          // (this ensures that cursor position will be always set just before first placeholder if parsedValue is empty)
          (!encounteredPlaceholder && parsedValueEmpty && this.showMask > i) ||
          // OR according to _actualCursorPos not all characters from parsedValue before cursorPos were added yet
          this._actualCursorPos > 0 ||
          // OR all characters from parsedValue before cursorPos were added AND no placeholders yet (or _actualCursorPos will be negative)
          // AND user just added symbols (see example in README under `trailing` option)
          (this.trailing && this._actualCursorPos === 0 && !this._isRemovingSymbols)
        ) {
          this.cursorPos++;
        }
      }
    }

    return output;
  }
}

(function processInputs() {
  const DOMInputs = <HTMLCollectionOf<HTMLTextAreaElement>>document.getElementsByClassName('rxmask');
  for (let i = 0; i < DOMInputs.length; i++) {
    const input = DOMInputs[i];
    const parser = new Parser();
    // Call it first time to parse all params and apply visible part of mask
    onInput(input, parser);
    // Add event
    input.oninput = () => onInput(input, parser);
  }
})();

export function onInput(input: HTMLTextAreaElement, parser: Parser) {
  // Assign params every time in case it changes on the fly
  parser.mask = input.getAttribute('mask') || '';
  parser.placeholderSymbol = input.getAttribute('placeholderSymbol') || '*';
  parser.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
  parser.allowedCharacters = input.getAttribute('allowedCharacters') || '.';
  parser.showMask = input.getAttribute('showMask') === 'true' ? Infinity : Number(input.getAttribute('showMask'));
  parser.trailing = input.getAttribute('trailing') === 'false' ? false : true;
  parser.value = input.value;
  parser.cursorPos = input.selectionStart;
  // Call parser
  parser.parseMask();
  // Everything is parsed, set output and cursorPos
  input.value = parser.output;
  input.setSelectionRange(parser.cursorPos, parser.cursorPos);
}
