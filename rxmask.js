// TODO: Add HTML to test
// TODO: Add tests and try to crash it in every possible way
// TODO: Transform it into a module

// TODO: Add just number and just letter support
let maskSymb = '*';
let mask = '+7 (***) ***-**-**';
let phoneInput = '1';

function maskToRegex(mask, maskSymbol) {
  let regexStr = RegExp(`(\\${maskSymbol}+)`);
  let regexArr = mask.split(regexStr);
  if (regexArr[regexArr.length - 1].length == 0) regexArr.slice(-1);
  regexArr = regexArr.map((el) => {
    if (el.indexOf(maskSymbol) != -1) {
      return `(${el.replace(RegExp('\\' + maskSymbol, 'g'), '.?')})`;
    } else {
      return `(?:${el.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})?`;
    }
  });
  return RegExp(regexArr.join(''));
}

function getRawPhone(phoneInput, mask) {
  let rawArr = phoneInput.match(mask);
  if (rawArr) {
    return rawArr.slice(1).join('');
  } else {
    return '';
  }
}

function applyMask(rawPhone, mask, maskSymb) {
  rawPhone = [...rawPhone];
  return [...mask].map((el) => {
    return (el == maskSymb) ? rawPhone.shift() : el;
  }).join('');
}

let maskStr = maskToRegex(mask, maskSymb);
let rawPhone = getRawPhone(phoneInput, maskStr);
let resultStr = applyMask(rawPhone, mask, maskSymb);

console.log(maskStr);
console.log(rawPhone);
console.log(resultStr);
