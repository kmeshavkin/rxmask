class Input {
  mask: string;
  maskSymbol: string;
  value: string;
  prevValue: string;
  cursorPos: number;
  output: string;
  allowedSymbols: RegExp;
  showMask: boolean;
  isAdding: boolean;

  constructor() {
    this.mask = '';
    this.maskSymbol = '';
    this.value = '';
    this.prevValue = '';
    this.output = '';
    this.cursorPos = 0;
    this.allowedSymbols = /./;
    this.showMask = false;
    this.isAdding = true;
  }

  parseMask() {
    const rawValue = this.getRawValue();
    this.output = this.getOutput(rawValue);
    this.prevValue = this.output;
  }


  getRawValue() {
    // Get length diff between old and current value
    const diff = this.value.length - this.prevValue.length;
    this.isAdding = diff >= 0;

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

  // If showMask === true, cursor position is wrong

  // Place cursor before - in ***-**-**, press delete - nothing happens

  // Maybe if mask is completed, disallow adding symbols? 

  getOutput(rawValue: string) {
    let output = '';
    const prevCursorPos = this.cursorPos;
    for (let i = 0; i < this.mask.length; i++) {
      if (this.mask[i] === this.maskSymbol) {
        if (rawValue.length === 0) {
          if (!this.showMask) break;
          output += this.mask[i];
        } else {
          output += rawValue[0];
          rawValue = rawValue.slice(1);
          if (rawValue.length === 0 && !this.isAdding && !this.showMask) break; // if deleting symbols or not
        }
      } else {
        output += this.mask[i];
        if (this.isAdding && i <= prevCursorPos) this.cursorPos++;
      }
    }

    return output;
  }

  regexLiteral(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

(function processInputs() {
  const DOMInputs = <HTMLCollectionOf<HTMLTextAreaElement>>document.getElementsByClassName('rxmask');
  const inputs = [];
  for (let i = 0; i < DOMInputs.length; i++) {
    const input = DOMInputs[i];
    const inputObj = new Input();
    inputs.push(inputObj);
    onInput(input, inputObj);
    input.oninput = () => onInput(input, inputObj);
  }
})();

function onInput(input: HTMLTextAreaElement, inputObj: Input) {
  inputObj.mask = input.getAttribute('mask') || '';
  inputObj.maskSymbol = input.getAttribute('maskSymbol') || '*';
  inputObj.allowedSymbols = new RegExp(input.getAttribute('allowedSymbols') || '.', 'g');
  inputObj.showMask = Boolean(input.getAttribute('showMask')) || false;
  inputObj.value = input.value;
  inputObj.cursorPos = input.selectionStart;
  inputObj.parseMask();
  //
  input.value = inputObj.output;
  input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
}
