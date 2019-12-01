interface InputOptions {
  mask?: string;
  placeholderSymbol?: string;
  rxmask?: string;
  value?: string;
  cursorPos?: number;
  allowedCharacters?: string;
  showMask?: number;
  trailing?: boolean;
}

interface Options {
  mask: string;
  placeholderSymbol: string;
  rxmask: string[];
  value: string;
  cursorPos: number;
  allowedCharacters: string;
  showMask: number;
  trailing: boolean;
}

export default class Parser {
  options: Options = {
    mask: '',
    placeholderSymbol: '*',
    rxmask: [],
    value: '',
    cursorPos: 0,
    allowedCharacters: '.',
    showMask: 0,
    trailing: true
  };
  input: HTMLTextAreaElement | HTMLInputElement | undefined;
  private _output: string = '';
  private _prevValue: string = '';
  private _isRemovingSymbols: boolean = false;
  private _actualCursorPos: number = 0;
  private _finalCursorPos: number = 0;

  constructor(options?: InputOptions, input?: HTMLTextAreaElement | HTMLInputElement) {
    this.input = input;
    this.setOptions(options || {});
    if (this.input) this.onInput();
  }

  get output() {
    return this._output;
  }

  get finalCursorPos() {
    return this._finalCursorPos;
  }

  /**
   * Takes options from input (if present) or from provided values, if input and provided value are undefined, do not change value
   * @param {InputOptions} options Options to set
   */
  setOptions({
    mask,
    placeholderSymbol,
    rxmask,
    allowedCharacters,
    showMask,
    trailing,
    value,
    cursorPos
  }: InputOptions) {
    if (this.input) {
      mask = this.parseNull(this.input.getAttribute('mask')) || mask;
      placeholderSymbol = this.parseNull(this.input.getAttribute('placeholderSymbol')) || placeholderSymbol;
      rxmask = this.parseNull(this.input.getAttribute('rxmask')) || rxmask;
      allowedCharacters = this.parseNull(this.input.getAttribute('allowedCharacters')) || allowedCharacters;
      showMask =
        (this.input.getAttribute('showMask') === 'true' ? Infinity : Number(this.input.getAttribute('showMask'))) ||
        showMask;
      if (this.input.getAttribute('trailing') !== null) trailing = this.input.getAttribute('trailing') === 'true';
      value = this.parseNull(this.input.value);
      cursorPos = this.parseNull(this.input.selectionStart);
    }

    if (mask !== undefined) this.options.mask = mask;
    if (placeholderSymbol !== undefined) this.options.placeholderSymbol = placeholderSymbol;
    if (rxmask !== undefined) this.options.rxmask = this.strToRxmask(rxmask);
    if (allowedCharacters !== undefined) this.options.allowedCharacters = allowedCharacters;
    if (showMask !== undefined) this.options.showMask = showMask;
    if (trailing !== undefined) this.options.trailing = trailing;
    if (value !== undefined) this.options.value = value;
    if (cursorPos !== undefined) this.options.cursorPos = cursorPos;

    // Parse rxmask in the end
    if (this.options.rxmask.length === 0) {
      this.options.rxmask = this.options.mask.split('').map(char => {
        if (char === this.options.placeholderSymbol) return '[^]';
        return char;
      });
    }
  }

  /**
   * If this method is called, it will cause options update (with this.input values), call of this.parseMask()
   * and update of new value of this.input (this.input.value) and cursor position (this.input.setSelectionRange)
   * according to changes introduced by this.parseMask()
   */
  onInput() {
    // Assign params every time in case it changes on the fly
    this.setOptions({});
    // Call parser
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
    const noMaskValue = this.parseOutMask();
    const parsedValue = this.parseRxmask(noMaskValue);
    this._output = this.getOutput(parsedValue);
    this._prevValue = this._output;
  }

  // Idea here is to parse everything before cursor position as is,
  // but parse everything after cursor as if it was shifted by inserting some symbols on cursor position.
  // This method is trying to remove mask symbols, but it still leaves symbols that are not allowed
  // TODO: Add example
  private parseOutMask() {
    const { value, cursorPos, rxmask, placeholderSymbol, allowedCharacters } = this.options;
    // Get length diff between old and current value
    const diff = value.length - this._prevValue.length;
    this._isRemovingSymbols = diff >= 0 ? false : true;

    // Get value after cursor without mask symbols
    let afterCursor = '';
    for (let i = cursorPos; i < value.length; i++) {
      // Diff used here to "shift" mask to position where it supposed to be
      if (value[i] !== rxmask[i - diff] && value[i] !== placeholderSymbol && value[i].match(allowedCharacters)) {
        afterCursor += value[i];
      }
    }

    // Get value before cursor without mask symbols
    let beforeCursor = '';
    for (let i = 0; i < cursorPos; i++) {
      if (value[i] !== rxmask[i] && value[i] !== placeholderSymbol && value[i].match(allowedCharacters)) {
        // If parsed value length before cursor so far less than
        // amount of allowed symbols in rxmask minus parsed value length after cursor, add symbol
        if (beforeCursor.length < rxmask.filter(pattern => pattern.match(/\[.*\]/)).length - afterCursor.length)
          beforeCursor += value[i];
      }
    }

    this._actualCursorPos = beforeCursor.length; // it holds position of cursor after input was parsed
    return beforeCursor + afterCursor;
  }

  private parseRxmask([...noMaskValue]: string) {
    const { rxmask } = this.options;
    let parsedValue = '';
    const filteredRxmask = rxmask.filter(pattern => pattern.match(/\[.*\]/));
    let i = 0;
    while (noMaskValue.length > 0 && i < noMaskValue.length) {
      if (noMaskValue[i].match(new RegExp(filteredRxmask[i]))) {
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

  private getOutput([...parsedValue]: string) {
    const { rxmask, showMask, placeholderSymbol, trailing } = this.options;
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
        } else if (showMask > i) {
          output += placeholderSymbol;
          encounteredPlaceholder = true;
        } else {
          break;
        }
        if (this._actualCursorPos > 0) this._finalCursorPos++;
        this._actualCursorPos--; // reduce this because one symbol or placeholder was added
      } else {
        // Add mask symbol if
        if (
          // mask is not fully shown according to this.showMask
          showMask > i ||
          // OR there's some parsed characters left to add
          parsedValue.length > 0 ||
          // OR this mask symbol is following parsedValue character AND user just added symbols (not removed)
          // AND (trailing should be enabled OR mask is filled, then add trailing symbols anyway) - see example in README under `trailing` option
          ((trailing || isMaskFilled) && !encounteredPlaceholder && !this._isRemovingSymbols)
        ) {
          output += rxmask[i];
        } else {
          break;
        }
        // Add 1 to cursorPos if
        if (
          // no placeholder was encountered AND parsedValue is empty AND this mask symbol should be shown
          // (this ensures that cursor position will be always set just before first placeholder if parsedValue is empty)
          (!encounteredPlaceholder && parsedValueEmpty && showMask > i) ||
          // OR according to _actualCursorPos not all characters from parsedValue before cursorPos were added yet
          this._actualCursorPos > 0 ||
          // OR all characters from parsedValue before cursorPos were added AND no placeholders yet (or _actualCursorPos will be negative)
          // AND user just added symbols (see example in README under `trailing` option)
          (trailing && this._actualCursorPos === 0 && !this._isRemovingSymbols)
        ) {
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
  private strToRxmask(str: string | null | undefined) {
    return (str || '').match(/(\[.*?\])|(.)/g) || [];
  }

  /**
   * Checks if value is null and returns undefined only in that case. Created to correctly parse .getAttribute() from HTMLTextAreaElement or HTMLInputElement
   * @param {any} val Value from input object
   * @return {undefined | any} val or undefined if val is null
   */
  private parseNull(val: any) {
    return val === null ? undefined : val;
  }
}

(function processInputs() {
  const DOMInputs = <HTMLCollectionOf<HTMLTextAreaElement | HTMLInputElement>>document.getElementsByClassName('rxmask');
  for (let i = 0; i < DOMInputs.length; i++) {
    const input = DOMInputs[i];
    const parser = new Parser({}, input);
    // Add event
    input.oninput = () => parser.onInput();
  }
})();
