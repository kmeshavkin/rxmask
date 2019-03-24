/**
 * Returns regular expression based on input parameters.
 * @param {String} mask Input string mask
 * @param {String} maskSymbol Character that represents a replaceable character in mask (should be one character long)
 * @param {String} customRegex Regular expression in raw string form to be applied to every replaceable character
 * @return {RegExp} Returns regular expression. You can use this expression to later extract raw input from string
 * @example
 * maskToRegex('[***]', '*', '[01]')
 * // Will return this expression: /(?:\[)?([01]{0,3})(?:\])?/
 */
function maskToRegex(mask, maskSymbol, customRegex) {
  return mask.split(RegExp(`(${regexLiteral(maskSymbol)}+)`))
      .map((el) => replaceSymbol(el, maskSymbol, customRegex))
      .join('');
}

/**
 * Use this for <input> element, pass this into "oninput" event.
 * @param {Object} element Pass {this} into this parameter, it operates provided input
 * @param {String} mask Mask string itself
 * @param {String} [maskSymbol] Symbol in mask that will be interpreted as symbol to replace with typed value
 * @param {Boolean} [showMask] Show unfilled part of mask or not
 * @param {RegExp} [customRegex] Regex expression to be evaluated upon every replaceable symbol
 * @example
 * // Will replace all * symbols only with numbers from 1 to 5
 * <input oninput="inputMask(this, '+7 (***) ***-**-**', '*', true, /[1-5]/)"></input>
 */
function inputMask(element, mask, maskSymbol = '*', showMask = false, customRegex = /\d/) {
  try {
    mask += ''; maskSymbol += '';

    if (!(customRegex instanceof RegExp)) throw new Error('Regex object was not provided!');
    if (!mask.length) throw new Error('Wrong mask provided!');
    if (!maskSymbol.length) throw new Error('Wrong mask symbol provided');

    customRegex = customRegex.source;
    maskSymbol = maskSymbol[0];

    const position = element.selectionStart;

    const maskStr = maskToRegex(mask, maskSymbol, customRegex);
    const rawInput = getRawInput(element.value, maskStr);
    const resultStr = applyMask(rawInput, mask, maskSymbol, showMask);
    element.value = resultStr;

    element.selectionEnd = element.selectionStart = setCursorPos(position, mask, maskSymbol);
  } catch (e) {
    console.log(e);
  }
}

function getRawInput(input, mask) {
  const rawArr = input.match(mask);
  if (rawArr) {
    return rawArr.slice(1).join('');
  } else {
    return '';
  }
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

function applyMask([...rawInput], [...mask], maskSymbol, showMask) {
  return mask.map((el) => {
    if (rawInput.length < 1) return (showMask) ? el : '';
    else return (el == maskSymbol) ? rawInput.shift() : el;
  }).join('');
}

function setCursorPos(prevPos, mask, maskSymbol) {
  const rawSymbolPos = mask.indexOf(maskSymbol, prevPos - 1);
  return (rawSymbolPos == -1) ? prevPos : rawSymbolPos + 1;
}
