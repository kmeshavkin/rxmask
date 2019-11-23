## TODO
### Overall
* Better example (more examples where adding character that already in mask is useful + better styling + convey that any character can be used, including some that in mask + allow to play with mask and change params on the fly)
* Better README (GIF at the top, something like plates with browser support, etc.)
* Minify rxmask.js and add polyfills (then remove from README)
* Provide typescript support for imports (then remove from README)
* Provide options for class constructor (also maybe add option to disable trailing mask symbols (when `123` results in `123-` if mask is `***-**-**`)) (then remove from README)
### Tests
* Add more tests for other inputs similar to simple input + tests for cursorPos for showMask tests (both part and full)
* test CTRL+backspace
* deletion in the middle for regex input

## Bugs
* ! Regex mask is somewhat broken when trying to add characters before some typed characters (not yet covered by tests)
* "Stop user from adding characters after mask is completed" is bugged for CTRL+V (if pasting adds to much characters, it will not be added)
* CursorPos after Selection + pasting works incorrectly due to _diff value
* If user adds character, that is "placeholderSymbol" (if was allowed), cursor will move (should not)
* Place cursor before - in `***-**-**`, press delete - nothing happens (expected behavior?)
* NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter)