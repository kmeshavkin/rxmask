(function processInputs() {
    const DOMInputs = document.getElementsByClassName('rxmask');
    const inputs = [];
    // // @ts-ignore
    // window.test = inputs;
    for (let i = 0; i < DOMInputs.length; i++) {
        inputs.push(new Input(DOMInputs[i]));
    }
})();
function Input(input) {
    this.input = input;
    this.prevValue = '';
    input.oninput = () => {
        const mask = input.getAttribute('mask');
        const maskSymbol = input.getAttribute('maskSymbol');
        let cursorPos = input.selectionStart;
        const parsedMask = parseMask(mask, maskSymbol);
        let tempParsedMask = parsedMask;
        let rawValue = input.value.split('').reduce((acc, c) => {
            if (tempParsedMask[0] === c) {
                tempParsedMask = tempParsedMask.slice(1);
                return acc;
            }
            return acc + c;
        }, '');
        let output = '';
        const splMask = mask.split('');
        for (let i = 0; i < splMask.length; i++) {
            if (rawValue.length === 0)
                break;
            if (splMask[i] === maskSymbol) {
                output += rawValue[0];
                rawValue = rawValue.slice(1);
            }
            else {
                output += splMask[i];
                cursorPos++;
            }
        }
        input.value = output;
        input.setSelectionRange(cursorPos, cursorPos);
        // End
        this.prevValue = input.value;
    };
}
function parseMask(mask, maskSymbol = '*') {
    return mask.replace(new RegExp(regexLiteral(maskSymbol), 'g'), '');
}
function regexLiteral(rx) {
    return rx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
