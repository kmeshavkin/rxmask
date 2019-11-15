# TODO
* Better example (IP Address, time, day time (+ more examples where adding symbol that already in mask is useful) + better styling + convey that any symbol can be used, including some that in mask + allow to play with mask and change params on the fly)
* Allow to both install as module or use it in plain HTML
* Redo README below
* Add UI testing (Cypress?)

# Bugs
* If showMask === true, cursor position is wrong (place cursor in the middle of mask and paste symbols)
* Place cursor before - in ***-**-**, press delete - nothing happens

# Features?
* Both module and simple HTML script
* Flexible - allows to change mask, placeholder symbol format, show or hide unfilled mask and more
* Allows to use same symbols that are present in mask
* Allows to specify format for every symbol

# Old stuff, redo

# rxmask.js
## Description
Very simple to install and use mask for <input> made using regex.
Basically it uses regular expression to parse mask and then dynamically creates another regex to parse whatever content is in <input> tag. 
I decided against making it full blown module or library so it's a bit less practical, but that way I will not bloat this project too much.
Testing is what really needed in this project, though I decided against using it just for simplicity's sake so I can move on to another project. Later I can get back to this project when I will be more experienced with modules, testing and other common practices (also with fixing bugs), maybe even making full-blown library out of this.

## How to use
Use this for <input> element, pass this into "oninput" event (this will replace all * characters only with numbers from 1 to 5):

`<input oninput="inputMask(this, '+7 (***) ***-**-**', '*', /[1-5]/)"></input>`

## Project focus
Currently I create GitHub projects only to practice JS stuff that I learned in theory. Here's list of why I created this particular project and some key features of it:
* Regex - both using it directly and creating it from the user's request (from mask)
* Simple error handling and making code more robust in general (need to work on this more, seems subpar currently)
* Tried JSDoc on one function, will dive into it further
* Some of ES6 features (really like spread operator and default function parameters)

## Known issues/bugs
* Symbol deletion is not perfect, especially when there are characters left after cursor. Due to this deleting characters when [showMask] == true is not easy and even without it it sometimes works not as expected
* Generated regular expression is sometimes not smart enough for pasted values, though works most of the time if value pasted is close enough to provided mask
* NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter)
* Although you are able to pass any regex expression in [customRegex] for type of replaceable symbols, I highly recommend you to pass only one symbol regex (in square brackets) and only characters that are not presented in mask (for example, you can safely type "!" in mask like "(-----)", but not in mask like "(-----)!"), otherwise it can lead to unexpected results

## TO-DO in future
* Currently no support for custom regex for mask (where you can specify each symbol to make date mask, for example), which is a huge functionality reduction, but requires too much changes in current state - will get to it when I will come back to this project
* Fixed mask start (where ir always displayed no matter what)
* Expand a project to module with proper exports and test coverage (?)
