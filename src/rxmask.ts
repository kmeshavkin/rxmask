class Input {
  mask: string;
  maskSymbol: string;
  value: string;
  cursorPos: number;
  output: string;

  constructor(mask: string, maskSymbol: string, value: string, cursorPos: number) {
    this.mask = mask;
    this.maskSymbol = maskSymbol;
    this.value = value;
    this.cursorPos = cursorPos;
    this.output = '';
  }

  onChange() {
    const parsedMask = this.getParsedMask(this.mask, this.maskSymbol);
    const rawValue = this.getRawValue(this.value, parsedMask);
    this.output = this.getOutput(rawValue, this.mask, this.maskSymbol);
  }


  getRawValue(inputValue: string, parsedMask: string): string {
    return inputValue.split('').reduce((acc, char) => {
      if (parsedMask[0] === char) {
        parsedMask = parsedMask.slice(1);
        return acc;
      }
      return acc + char;
    }, '');
  }

  getOutput(rawValue: string, mask: string, maskSymbol: string) {
    let output = '';
    const splMask = mask.split('');
    for (let i = 0; i < splMask.length; i++) {
      if (rawValue.length === 0) break;
      if (splMask[i] === maskSymbol) {
        output += rawValue[0];
        rawValue = rawValue.slice(1);
      } else {
        output += splMask[i];
        this.cursorPos++;
      }
    }
    return output;
  }

  getParsedMask(mask: string, maskSymbol = '*') {
    return mask.replace(new RegExp(this.regexLiteral(maskSymbol), 'g'), '');
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
    input.oninput = () => {
      const mask = input.getAttribute('mask') || '';
      const maskSymbol = input.getAttribute('maskSymbol') || '*';
      const value = input.value;
      const cursorPos = input.selectionStart;

      const inputObj = new Input(mask, maskSymbol, value, cursorPos);
      inputObj.onChange();
      input.value = inputObj.output;
      input.setSelectionRange(inputObj.cursorPos, inputObj.cursorPos);
    };
    inputs.push(input);
  }
})();
