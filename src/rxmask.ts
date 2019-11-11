class Input {
  mask: string;
  maskSymbol: string;
  value: string;
  cursorPos: number;
  output: string;
  prevValue: string;
  allowedSymbols: RegExp;
  showMask: boolean;

  constructor() {
    this.mask = '';
    this.maskSymbol = '';
    this.value = '';
    this.cursorPos = 0;
    this.output = '';
    this.prevValue = '';
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

  // 123
  // cursor after 2
  // paste 123
  // wrong cursor position

  // 123-1
  // cursor after 3, before -
  // paste 2
  // wrong cursor position

  // If showMask === true, cursor position is wrong

  // --- still works wrong

  getOutput(rawValue: string) {
    let output = '';
    for (let i = 0; i < this.mask.length; i++) {
      if (this.mask[i] === this.maskSymbol) {
        if (rawValue.length === 0) {
          if (!this.showMask) break;
          output += this.mask[i];
        } else {
          output += rawValue[0];
          rawValue = rawValue.slice(1);
        }
      } else {
        output += this.mask[i];
      }
    }
    const diff = output.length - this.prevValue.length - 1;
    if (diff > 0) this.cursorPos += diff;
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
