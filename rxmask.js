// TODO: Add HTML to test
// TODO: Add tests and try to crash it in every possible way
// TODO: Transform it into a module
// TODO: Add just number and just letter support
// TODO: Allow raw phone and mask to be extracted (get all intermediate steps)
// TODO: Better comment code
// TODO: Check for unicode support

function maskToRegex(mask, maskSymbol) {
  let regexArr = mask.split(RegExp(`(${regexLiteral(maskSymbol)}+)`));
  regexArr = regexArr.filter((el) => el);
  regexArr = regexArr.map((el) => replaceSymbol(el, maskSymbol));
  return RegExp(regexArr.join(''));
}

function replaceSymbol(el, maskSymbol) {
  if (el.indexOf(maskSymbol) != -1) {
    return `(${el.replace(RegExp(regexLiteral(maskSymbol), 'g'), '\\d?')})`; // ! Return to .
  } else {
    return `(?:${regexLiteral(el)})?`;
  }
}

function regexLiteral(rx) {
  return rx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRawInput(phoneInput, mask) {
  const rawArr = phoneInput.match(mask);
  if (rawArr) {
    return rawArr.slice(1).join('');
  } else {
    return '';
  }
}

function applyMask([...rawInput], [...mask], maskSymb) {
  return mask.map((el) => {
    if (rawInput.length < 1) return ''; // TODO: Let user decide - keep rest of mask or not
    return (el == maskSymb) ? rawInput.shift() : el;
  }).join('');
}

function setCursorPos(prevPos, mask, maskSymbol) {
  const rawSymbolPos = mask.indexOf(maskSymbol, prevPos - 1);
  return (rawSymbolPos == -1) ? prevPos : rawSymbolPos + 1;
}

function inputMask(element, mask, maskSymbol = '*') {
  // TODO: function for removing symbol on cursor position if value.length > mask.length
  const position = element.selectionStart;
  let maskStr = maskToRegex(mask, maskSymbol);
  maskStr = /(?:.*\+.*7.* .*\()?(\d*)(?:\).* )?(\d*)(?:-)?(\d*)(?:-)?(\d*)/; // ! Placeholder, modify maskToRegex
  console.log(maskStr);
  const rawInput = getRawInput(element.value, maskStr);
  console.log(rawInput);
  const resultStr = applyMask(rawInput, mask, maskSymbol);
  element.value = resultStr;
  element.selectionEnd = setCursorPos(position, mask, maskSymbol);
}
