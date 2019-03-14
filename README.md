# rxmask.js
## Description
Very simple to install and use mask for <input> made using regex.
I decided against making it full blown module or library so it's a bit less practical, but that way I will not bloat this project too much.
Testing is what really needed in this project, though I decided against using it just for simplicity's sake so I can move on to another project. Later I can get back to this project when I will be more experienced with modules, testing and other common practices, maybe evern making full-blown library out of this.

## How to use
Use this for <input> element, pass this into "oninput" event (this will replace all * symbols only with numbers from 1 to 5):
<input oninput="inputMask(this, '+7 (***) ***-**-**', '*', /[1-5]/)"></input>

## Project focus
Currently I create GitHub projects only to practice JS stuff that I learned in theory. Here's list of why I created this particular project and some key features of it:
* Regex - both using it directly and creating it from the user's request (from mask)
* Simple error handling and making code more robust in general (need to work on this more, seems subpar currently)
* Tried JSDoc on one function, will dive into it further
* Some of ES6 features (really like spread operator and default function parameters)