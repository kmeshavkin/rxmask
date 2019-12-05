## TODO

### Tests

- Add more tests for other inputs similar to simple input
- Add tests for Parser class and onInput() function?
- test CTRL+backspace?

## Bugs

- Place cursor before - in `***-**-**`, press delete - nothing happens (expected behavior?)
- NOT Unicode friendly (or any character that is represented by more than one UTF-16 code unit for that matter) - planned feature
- Try-catch (in .match, for example)
