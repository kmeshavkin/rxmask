// TODO: Add HTML to test
// TODO: Add tests and try to crash it in every possible way
// TODO: Transform it into a module
// TODO: Add just number and just letter support
// TODO: Allow raw phone and mask to be extracted (get all intermediate steps)
// TODO: Better comment code
// TODO: Check for unicode support
// TODO: Fixed start of mask

function maskToRegex(mask, maskSymbol, customRegex) {
  let regexArr = mask.split(RegExp(`(${regexLiteral(maskSymbol)}+)`));
  regexArr = regexArr.filter((el) => el);
  regexArr = regexArr.map((el) => replaceSymbol(el, maskSymbol, customRegex));
  return RegExp(regexArr.join(''));
}

function replaceSymbol(el, maskSymbol, customRegex) {
  if (el.indexOf(maskSymbol) != -1) {
    return `(${customRegex}{0,${el.length}})`;
  } else {
    return [...el].map((ele) => `(?:${regexLiteral(ele)})?`).join('');
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

function applyMask([...rawInput], [...mask], maskSymbol) {
  return mask.map((el) => {
    if (rawInput.length < 1) return ''; // TODO: Let user decide - keep rest of mask or not
    return (el == maskSymbol) ? rawInput.shift() : el;
  }).join('');
}

function setCursorPos(prevPos, mask, maskSymbol) {
  const rawSymbolPos = mask.indexOf(maskSymbol, prevPos - 1);
  return (rawSymbolPos == -1) ? prevPos : rawSymbolPos + 1;
}

/**
 * Use this for <input> element, pass this into "oninput" event
 * @example
 * /// Will replace all * symbols only with numbers from 1 to 5
 * <input oninput="inputMask(this, '+7 (***) ***-**-**', '*', /[1-5]/)"></input>
 *
 * @param {Object} element Pass {this} into this parameter, it operates provided input
 * @param {String} mask Mask string itself
 * @param {String} [maskSymbol] Symbol in mask that will be interpreted as symbol to replace with typed value
 * @param {RegExp} [customRegex] Regex expression to be evaluated upon typed value
 */
function inputMask(element, mask, maskSymbol = '*', customRegex = /./) {
  try {
    mask += ''; maskSymbol += ''; // Guard for non string values

    if (!(customRegex instanceof RegExp)) throw new Error('Regex object was not provided!');
    if (!mask.length) throw new Error('Wrong mask provided!');
    if (!maskSymbol.length) throw new Error('Wrong mask symbol provided');

    // Format stuff
    customRegex = customRegex.source;
    maskSymbol = maskSymbol[0];

    const position = element.selectionStart;

    const maskStr = maskToRegex(mask, maskSymbol, customRegex);
    const rawInput = getRawInput(element.value, maskStr);
    const resultStr = applyMask(rawInput, mask, maskSymbol);
    element.value = resultStr;

    element.selectionEnd = setCursorPos(position, mask, maskSymbol); // ! Sometimes it selects one element, fix
  } catch (e) {
    console.log(e);
  }
}
