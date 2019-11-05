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
    parseMask(input.getAttribute('mask'), input.getAttribute('maskSymbol'));
    input.value = input.value + '3';
    // End
    this.prevValue = input.value;
  };
}

function parseMask(mask, maskSymbol) {
  console.log(mask, maskSymbol);
}
