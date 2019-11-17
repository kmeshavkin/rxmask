# rxmask.js
## Features
* Both module and simple HTML script
* Flexible - allows to change mask, placeholder symbol format, show or hide unfilled mask (or even part of it) and more
* Allows to use same symbols that are present in mask
* Allows to specify format for every symbol

## Description (outdated, update)
Simple to install and use, but advanced mask for <input>.

## How to use (outdated, update)
Use this for <input> element, pass this into "oninput" event (this will replace all * characters only with numbers from 1 to 5):
`<input oninput="inputMask(this, '+7 (***) ***-**-**', '*', /[1-5]/)"></input>`

## TODO
* Better example (IP Address, time, day time (+ more examples where adding symbol that already in mask is useful) + better styling + convey that any symbol can be used, including some that in mask + allow to play with mask and change params on the fly)
* Better structure class (at least add options object upon initialization)
* Allow to both install as module or use it in plain HTML

## Bugs
* Place cursor before - in ***-**-**, press delete - nothing happens
* If maskSymbol includes "symbol" property itself, cursor will move
* "Stop user from adding symbols after mask is completed" is bugged for CTRL+V (if pasting adds to much symbols, it will not be added)
* NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter)
