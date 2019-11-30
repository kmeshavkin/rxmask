# rxmask.js
Simple to install and use, but advanced mask package.

![minzipped size](https://img.shields.io/bundlephobia/minzip/rxmask)
![downloads/month](https://img.shields.io/npm/dm/rxmask)
![type definitions](https://img.shields.io/npm/types/rxmask)

## <a name="Features"></a>Features
* Both module and simple HTML script
* Flexible - allows to change mask, placeholder symbol format, show or hide unfilled mask (or even part of it) and more
* Allows to use same characters that are present in mask
* Allows to specify format for every character
* Robust (test coverage with Cypress)
* No dependencies

## Table of contents
* [Features](#Features)
* [Example](#Example)
* [Installation](#Installation)
  * [Options](#Installation/Options)
* [Notes](#Notes)
* [Testing](#Testing)

## <a name="Example"></a>Example
Playground will be provided later. For now you can see `example/example.html` in the project.

You can view source code in `./src folder`: `rxmask.ts` for typescript or `rxmask.js` for javascript.

## <a name="Installation"></a>Installation
### Use it in script tag
It will work for simple plain html files.

Download `rxmask.min.js` file from `src/rxmask.min.js` (minified and polyfilled).
```HTML
<head>
  <script src="../src/rxmask.min.js"></script>
</head>
<body>
  <input class="rxmask" mask="***-**-**" placeholderSymbol="*" allowedCharacters="[0-9]"/>
</body>
```
You should include `class="rxmask"` in your input - it's the only way for script to automatically parse DOM tree for inputs to be applied mask to. Also you can add any of the [Options](#Installation/Options) **in the first section** to the input as properties. See `example.html` for more some examples.

You can also use unminified `rxmask.js` file, though I recommend to use minified due to far smaller size and superior browser support. If you still want to use unminified version (I used it in example for easier debugging), replace `<script>` tag with this:
```HTML
<script type="module" src="../src/rxmask.js"></script>
```

### Import `Parser` class and `onInput` function from imported `rxmask.js` file
* `npm i rxmask`
* Import `Parser` class (it has default export) and `onInput()` function: `import rxmask, { onInput } from 'rxmask'`
* Create instance of `Parser` class and provide it to `onInput` function alongside with `input` object itself (it should accept basic, React or any other input as long as it's derived from <HTMLTextAreaElement> type):
```javascript
  const parser = new rxmask();
  onInput(input, parser);
```

Typescript support (types file) is provided with package.

### Import just `Parser` class and provide it with required props yourself
It's useful if you want to just parse value according to any mask, detached from any actual input element.

* `npm i rxmask`
* Import `Parser` class: `import rxmask from 'rxmask'`
* Create instance of `Parser` class and add any required options to it with at least input value (and also cursor position if you need to recalculate it), then call `parseMask()` to precess input value:
```javascript
  const parser = new rxmask();
  parser.mask = '***-**-**';
  parser.placeholderSymbol = '*';
  // ... and any other options, provide them at least once
  // Then provide value (and cursorPos if needed) and call parseMask()
  parser.value = '1234';
  parser.parseMask();
  // parser.output will have value of '123-4' 
```

Note that under the hood class stores previous value, so if you want to just parse string once, you need to reinitialize class every time and it will assume that previous value was empty string (this is subject to change).

Options for class constructor will be provided later.

### <a name="Installation/Options"></a>Options
These options can be provided both to `Parser` class itself and as `<input>` tag properties:
* `mask` - mask, should include `placeholderSymbol`, otherwise user will not be able to type any characters.
* `rxmask` - regex mask (if `rxmask` is present, `mask` will be ignored), characters in square brackets will be parsed as characters for user input, any other character will be parsed as mask symbol.
* `placeholderSymbol` - symbol, that specifies character that will be replaced in mask with user input.
* `allowedCharacters` - characters allowed to be used in this input. If this option is present, all other characters will be ignored when user types them.
* `showMask` - show whole mask, part of it or not show it at all (can be any `number`, but you can also provide `true` if you use `onInput` function or script tag).
* `trailing` - if trailing is `true`, show trailing mask symbols. Example: if with mask `***--**-**` user types `123`, user will get `123--`, but if he removes symbol `4` from `123--4`, he will get just `123` without `-`. If trailing is disabled, regardless of user actions value `123` will always result in just `123`.

Rest are class only options:
* `value` - assign to it value you want to parse
* `cursorPos` - you can assign to it cursor position value (in case of `<input>` it's `selectionStart` property) which will be modified after mask parsing, then you can use `cursorPos` class property as cursor position for your desired input (in case of `<input>` it's `<HTMLTextAreaElement>.setSelectionRange(parser.cursorPos, parser.cursorPos)`). See [example](#Installation/Options/Example) below.
* `parseMask()` method - you should call this method when you assigned all required parameters to `Parser` class instance. It will parse the mask and update `output` and `cursorPos` values.
* `output` - parsed `value`. Grab it after you called `parseMask()`. This value is the correct field to use as parsed mask value.
#### <a name="Installation/Options/Example"></a>Example
Here's example from `rxmask.ts` of how you can set up your own parser.

In this example <HTMLTextAreaElement> input used for parameters parsing, but you can use any other input (with according methods) or just provide `mask` and other parameters yourself.

Here I call `onInput()` function every time `<input>` changes and assign parameters like `mask`, `placeholderSymbol` and others every time to be able to parse values correctly even if some of parameters on the input changes. You can assign all parameters except `value` and `cursorPos` only once and then just update `value` and `cursorPos` every time before `parseMask()` method call.

```javascript
function onInput(input: HTMLTextAreaElement, parser: Parser) {
  // Assign params every time in case it changes on the fly
  parser.mask = input.getAttribute('mask') || '';
  parser.placeholderSymbol = input.getAttribute('placeholderSymbol') || '*';
  parser.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
  parser.allowedCharacters = input.getAttribute('allowedCharacters') || '.';
  parser.showMask = input.getAttribute('showMask') === 'true' ? Infinity : Number(input.getAttribute('showMask'));
  parser.trailing = input.getAttribute('trailing') === 'false' ? false : true;
  parser.value = input.value;
  parser.cursorPos = input.selectionStart;
  // Call parser
  parser.parseMask();
  // Everything is parsed, set output and cursorPos
  input.value = parser.output;
  input.setSelectionRange(parser.cursorPos, parser.cursorPos);
}
```

## <a name="Notes"></a>Notes
* NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter) - planned feature

## <a name="Testing"></a>Testing
I use Live Server extension for VSCode for easier testing.
* Launch Live Server for example/example.html (default address is `http://127.0.0.1:5500/example/example.html`)
* `npm test` to launch Cypress
