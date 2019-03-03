let maskSymb = '*';
let mask = '+7 (***) ***-**-**';

function maskToRegex(maskSymbol, mask) {
  let regexStr = RegExp(`(\\${maskSymbol}+)`);
  let regexArr = mask.split(regexStr);
  if (regexArr[regexArr.length - 1].length == 0) regexArr.slice(-1);
  regexArr = regexArr.map((el) => {
    if (el.indexOf(maskSymbol) != -1) {
      return `(${el.replace(RegExp('\\' + maskSymbol, 'g'), '.')})`;
    } else {
      return `(?:${el.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`;
    }
  });
  return RegExp(regexArr.join(''));
}

function matchRawString() {
  
}

let maskStr = maskToRegex(maskSymb, mask);

console.log(maskStr);
console.log('+7 (123) 456-78-90'.match(maskStr));
