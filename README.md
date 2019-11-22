# rxmask.js
## Description
Simple to install and use, but advanced mask package. Some features:
* Both module and simple HTML script
* Flexible - allows to change mask, placeholder symbol format, show or hide unfilled mask (or even part of it) and more
* Allows to use same symbols that are present in mask
* Allows to specify format for every symbol
* Robust (test coverage using Cypress)

## Example
Playground will be provided later. For now you can see `example/example.html` in the project.

## How to install
`npm install rxmask` or download `rxmask.js` file (rxmask.min.js with polyfills will be provided later).

Then you have three options.

### Use it in script tag
It will work for simple plain html files
```HTML
<head>
  <script type="module" src="../src/rxmask.js"></script>
</head>
<body>
  <input class="rxmask" mask="***-**-**" symbol="*" allowedSymbols="[0-9]"/>
</body>
```
You should include `class="rxmask"` in your input - it's the only way for script to automatically parse DOM tree for inputs to be applied mask to. Also you can add any of the [Options](#params) **in the first section** to the input as properties. See `example.html` for more some examples.

### Import `Parser` class and `onInput` function from imported `rxmask.js` file
Create instance of `Parser` class and provide it to `onInput` function alongside with `input` object itself (it should accept basic, React or any other input as long as it's derived from <HTMLTextAreaElement> type).

Typescript support will be provided later.

### Import just `Parser` class and provide it with required props yourself
It's useful if you want to just parse value according to any mask, detached from any actual input element.

Options for class constructor will be provided later.

### <a name="params"></a>Options
These options can be provided both to `Parser` class itself and as `<input>` tag properties:
* `mask` - mask, should include `symbol`, otherwise user will not be able to type any characters.
* `rxmask` - regex mask (if `rxmask` is present, `mask` will be ignored), symbols in square brackets will be parsed as symbols for user input, any other symbol will be parsed as mask symbol.
* `symbol` - mask symbol, specifies character that will be replaced in mask with user input.
* `allowedSymbols` - characters allowed to be used in this input. If this option is present, all other characters will be ignored when user types them.
* `showMask` - show whole mask, part of it or not show it at all (can be any `number`, but you can also provide `true` if you use `onInput` function or script tag).

Rest are class only options:
* `value` - assign to it value you want to parse
* `cursorPos` - you can assign to it cursor position value (in case of `<input>` it's `selectionStart` property) which will be modified after mask parsing, then you can use `cursorPos` class property as cursor position for your desired input (in case of `<input>` it's `<HTMLTextAreaElement>.setSelectionRange(parser.cursorPos, parser.cursorPos)`). See [example](#classExample) below.
* `parseMask()` method - you should call this method when you assigned all required parameters to `Parser` class instance. It will parse the mask and update `output` and `cursorPos` values.
* `output` - parsed `value`. Grab it after you called `parseMask()`. This value is the correct field to use as parsed mask value.
#### <a name="classExample"></a>Example
Here's example from `rxmask.ts` of how you can set up your own parser.

In this example <HTMLTextAreaElement> input used for parameters parsing, but you can use any other input (with according methods) or just provide `mask` and other parameters yourself.

In this example I call `onInput()` function every time `<input>` changes and assign parameters like `mask`, `symbol` and others every time to be able to parse values correctly even if some of parameters on the input changes. You can assign all parameters except `value` and `cursorPos` only once and then just update `value` and `cursorPos` every time before `parseMask()` method call.

```javascript
function onInput(input: HTMLTextAreaElement, parser: Parser) {
  // Assign params every time in case it changes on the fly
  parser.mask = input.getAttribute('mask') || '';
  parser.symbol = input.getAttribute('symbol') || '*';
  parser.rxmask = (input.getAttribute('rxmask') || '').match(/(\[.*?\])|(.)/g) || [];
  parser.allowedSymbols = input.getAttribute('allowedSymbols') || '.';
  parser.showMask =
    input.getAttribute('showMask') === 'true' ? Infinity : Number(input.getAttribute('showMask'));
  parser.value = input.value;
  parser.cursorPos = input.selectionStart;
  // Call parser
  parser.parseMask();
  // Everything is parsed, set output and cursorPos
  input.value = parser.output;
  input.setSelectionRange(parser.cursorPos, parser.cursorPos);
}
```

## TODO
* Better example (more examples where adding symbol that already in mask is useful + better styling + convey that any symbol can be used, including some that in mask + allow to play with mask and change params on the fly)
* Better README (GIF at the top, something like plates with browser support, etc.)
* Minify rxmask.js and add polyfills (then remove from README)
* Provide typescript support for imports (then remove from README)
* Provide options for class constructor (then remove from README)

## Bugs
* !You can't paste mask symbol just before mask symbol (tests are commented out) 
* !Deleting mask symbols with showMask on will not move cursor correctly (to the previous this.symbol, see all " // should be" in example.spec.js)
* "Stop user from adding symbols after mask is completed" is bugged for CTRL+V (if pasting adds to much symbols, it will not be added)
* Selection + pasting works incorrectly for cursorPos due to _diff value
* If maskSymbol includes "symbol" property itself, cursor will move (should not)
* Place cursor before - in `***-**-**`, press delete - nothing happens
* NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter)

## Testing
I use Live Server extension for VSCode for easier testing.
* Launch Live Server for example/example.html (default address is `http://127.0.0.1:5500/example/example.html`)
* `yarn test` to launch Cypress
