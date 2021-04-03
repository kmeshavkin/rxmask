# rxmask.js

![minzipped size](https://img.shields.io/bundlephobia/minzip/rxmask)
![downloads](https://img.shields.io/npm/dt/rxmask)
![type definitions](https://img.shields.io/npm/types/rxmask)

Easy to install and use advanced mask package.

![Demo](https://i.imgur.com/zdByXPt.gif)

Playground: [https://rxmask.kmesh.dev/](https://rxmask.kmesh.dev/).

## Features

- Both module and simple HTML script
- Flexible - allows to change mask, placeholder symbol format, show or hide unfilled mask (or even part of it) and more
- Allows to use same characters that are present in mask
- Allows to specify format for every character
- Detailed input error log
- Robust (test coverage with Cypress)
- No dependencies

If you want to check my other projects, you can visit my portfolio: [https://portfolio.kmesh.dev/](https://portfolio.kmesh.dev/)

## Table of contents

- [rxmask.js](#rxmaskjs)
  - [Features](#features)
  - [Table of contents](#table-of-contents)
  - [Example](#example)
  - [Installation](#installation)
    - [Use it in script tag](#use-it-in-script-tag)
    - [Use it for existing `input` object (`<HTMLTextAreaElement>` or `<HTMLInputElement>` type)](#use-it-for-existing-input-object-htmltextareaelement-or-htmlinputelement-type)
    - [Use it to parse raw string value](#use-it-to-parse-raw-string-value)
    - [Options](#options)
  - [Notes](#notes)
  - [Testing](#testing)

## Example

You can see this package in action in playground: [https://rxmask.kmesh.dev/](https://rxmask.kmesh.dev/), or you can go to `example/example.html` in the project to see how this package works in plain HTML file.

You can view source code in `./src folder`: `rxmask.ts` for typescript or `rxmask.js` for javascript.

## Installation

### Use it in script tag

It will work for simple plain html files.

- Download `rxmask.min.js` file from `src/rxmask.min.js` (minified and polyfilled).
- Add downloaded script in the head of the document.

<a name="Installation/ScriptTag"></a>Example:

```HTML
<head>
  <script src="../src/rxmask.min.js"></script>
</head>
<body>
  <input class="rxmask" mask="***-**-**" placeholderSymbol="*" allowedCharacters="[0-9]"/>
</body>
```

You should include `class="rxmask"` in your input - it's the only way for script to automatically parse DOM tree for inputs to be applied mask to. Also you can add any of the [Options](#Installation/Options) **in the first section** to the input as properties. See `example.html` for more some examples.

You can also use unminified `rxmask.js` file, though it's recommended to use minified due to far smaller size and superior browser support. If you still want to use unminified version (I used it in example for easier debugging), replace `<script>` tag with this:

```HTML
<script type="module" src="../src/rxmask.js"></script>
```

### Use it for existing `input` object (`<HTMLTextAreaElement>` or `<HTMLInputElement>` type)

- `npm i rxmask`
- Import `Parser` class (it has default export).
- Create instance of `Parser` class and provide it with options alongside with `input` object itself (it should accept basic, React or any other input as long as it's derived from `<HTMLTextAreaElement>` or `<HTMLInputElement>` type).
- Add `parser.onInput` method to event of your input that is triggered on every input change.

Example:

```javascript
import rxmask from 'rxmask';
const input = document.getElementsByClassName('rxmask')[0];
const parser = new rxmask({}, input);
input.oninput = () => parser.onInput();
```

### Use it to parse raw string value

It's useful if you want to just parse value according to any mask, detached from any actual input element.

- `npm i rxmask`
- Import `Parser` class (it has default export).
- Create instance of `Parser` class and provide it with options (it's recommended to provide it at least with input value (and also cursor position if you need to calculate cursor position).
- Call `parseMask()` to process input value.

Example:

```javascript
import rxmask from 'rxmask';
const parser = new rxmask({ mask: '***-**-**', placeholderSymbol: '*' });
// You can provide value as an option, but it's recommended to add value separately every time before calling parseMask()
parser.options.value = '1234';
parser.parseMask();
// parser.output will have value of '123-4', finalCursorPos will have value of 5
```

Note that under the hood class stores previous value, so if you want to just parse string once, you need to reinitialize class every time so it will assume that previous value was empty string (this is subject to change).

### Options

These options can be provided both to `Parser` class itself (through options or property assignment) and as `<input>` tag properties (note that if you are using options in `<input>` tag, you should add `data-` before any option, like `data-maxMaskLength`):

- `mask` - mask, should include `placeholderSymbol`, otherwise user will not be able to type any characters.
- `rxmask` - regex mask (if `rxmask` is present, `mask` will be ignored), characters in square brackets will be parsed as characters for user input, any other character will be parsed as mask symbol.
- `placeholderSymbol` - symbol, that specifies character that will be replaced in mask with user input.
- `allowedCharacters` - characters allowed to be used in this input. If this option is present, all other characters will be ignored when user types them.
- `maxMaskLength` - show whole mask, part of it or not show it at all (can be any `number` including `Infinity` to show whole mask).
- `trailing` - if trailing is `true`, show trailing mask symbols. Example: if with mask `***--**-**` user types `123`, user will get `123--`, but if he removes symbol `4` from `123--4`, he will get just `123` without `-`. If trailing is disabled, regardless of user actions value `123` will always result in just `123`.

These are class only options:

- `value` - assign to it value you want to parse
- `cursorPos` - you can assign to it cursor position value (in case of `<input>` it's `selectionStart` property). After `parseMask()` was called, `finalCursorPos` will be updated with appropriate value.

Also class has some important methods and properties:

- `parseMask()` method - you should call this method when you assigned all required parameters to `Parser` yourself. It will parse the mask and update `output` and `finalCursorPos` values.
- `onInput()` method - you should call this method when you provided `Parser` class with `input` object. It will get all properties from provided `input`, call `parseMask()` and update `output` and `finalCursorPos` values.
  Grab this values after you called `parseMask()`
- `output` - parsed `value` that has applied mask to it. This value is the correct field to use as parsed mask value.
- `parsedValue` - parsed `value` before mask was applied. This value is the correct parsed value without mask.
- `finalCursorPos` - modified `cursorPos`. This value is the correct cursor position to use for your input.
- `errors` - array with errors on input. If no errors were made, this array is empty. If some errors were made, this array contains objects with wrong symbol, its position and error type.

## Notes

- Typescript support (types file) is provided with package.
- NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter) - planned feature

## Testing

I use Live Server extension for VSCode for easier testing.

- Launch Live Server for example/example.html (default address is `http://127.0.0.1:5500/example/example.html`)
- `npm test` to launch Cypress
