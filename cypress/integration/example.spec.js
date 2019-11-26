// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

// No way to test true text pasting aside from maybe this: https://github.com/cypress-io/cypress/issues/2752
// Also no way to select text in input for deleting multiple symbols ('should correctly parse multiple deleted characters') except maybe this: https://gist.github.com/erquhart/37bf2d938ab594058e0572ed17d3837a

before(() => {
  cy.visit('http://127.0.0.1:5500/example/example.html');
});

describe('Simple input with values restricted to numbers', () => {
  afterEach(() => {
    cy.get('input.simple').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.simple')
      .should('have.value', '')
      .type('123')
      .should('have.value', '123-')
      .and('have.prop', 'selectionStart', 4)
      .type('4')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .type('5')
      .should('have.value', '123-45-')
      .and('have.prop', 'selectionStart', 7)
      .type('6')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .type('7')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.simple')
      .type('1234567')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .type('{backspace}')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .type('{backspace}')
      .should('have.value', '123-45')
      .and('have.prop', 'selectionStart', 6)
      .type('{backspace}')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}')
      .should('have.value', '123')
      .and('have.prop', 'selectionStart', 3)
      .type('{backspace}{backspace}')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1);
  });

  it('should correctly apply mask for typed characters if some characters are present after cursor', () => {
    cy.get('input.simple')
      .type('12')
      .should('have.value', '12')
      .and('have.prop', 'selectionStart', 2)
      .type('{leftarrow}{leftarrow}3')
      .should('have.value', '312-')
      .and('have.prop', 'selectionStart', 1)
      .type('4')
      .should('have.value', '341-2')
      .and('have.prop', 'selectionStart', 2)
      .type('56')
      .should('have.value', '345-61-2')
      .and('have.prop', 'selectionStart', 5)
      .type('7')
      .should('have.value', '345-67-12')
      .and('have.prop', 'selectionStart', 7);
  });

  it('should correctly apply mask for deleted characters if some characters are present after cursor', () => {
    cy.get('input.simple')
      .type('1234567{leftarrow}{leftarrow}{leftarrow}{leftarrow}')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}')
      .should('have.value', '123-56-7')
      .and('have.prop', 'selectionStart', 3)
      .type('{backspace}')
      .should('have.value', '125-67')
      .and('have.prop', 'selectionStart', 2)
      .type('{backspace}')
      .should('have.value', '156-7')
      .and('have.prop', 'selectionStart', 1)
      .type('{del}')
      .should('have.value', '167')
      .and('have.prop', 'selectionStart', 1)
      .type('{del}')
      .should('have.value', '17')
      .and('have.prop', 'selectionStart', 1)
      .type('{del}')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', '')
      .and('have.prop', 'selectionStart', 0);
  });

  it('should correctly parse multiple pasted characters', () => {
    cy.get('input.simple')
      .invoke('val', '123')
      .trigger('input')
      .should('have.value', '123-')
      .and('have.prop', 'selectionStart', 4)
      .clear()
      .invoke('val', '1234567')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .clear()
      .invoke('val', '123-45-67')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .clear()
      .invoke('val', '123-456-7')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .clear()
      .invoke('val', '-a-12-3&-45$6-G7')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9);
  });

  it('should not allow to add more characters after mask is complete', () => {
    cy.get('input.simple')
      .type('123456')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .type('71')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .type('{leftarrow}1')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 8)
      .type('{leftarrow}{leftarrow}1')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 7)
      .clear()
      .invoke('val', '87654321')
      .trigger('input')
      .should('have.value', '876-54-32')
      .and('have.prop', 'selectionStart', 9);
  });

  it('should not allow to paste unsupported symbols', () => {
    cy.get('input.simple')
      .type('1')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .type('a')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .type('2c3&4')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .type('{leftarrow}{leftarrow}{leftarrow}c5G')
      .should('have.value', '125-34-')
      .and('have.prop', 'selectionStart', 4);
  });
});

describe('Input with showMask', () => {
  afterEach(() => {
    cy.get('input.showMask').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.showMask')
      .should('have.value', '+_ (___) ___-__-__')
      .type('123')
      .should('have.value', '+1 (23_) ___-__-__')
      .and('have.prop', 'selectionStart', 6)
      .type('4')
      .should('have.value', '+1 (234) ___-__-__')
      .and('have.prop', 'selectionStart', 9)
      .type('567')
      .should('have.value', '+1 (234) 567-__-__')
      .and('have.prop', 'selectionStart', 13)
      .type('89')
      .should('have.value', '+1 (234) 567-89-__')
      .and('have.prop', 'selectionStart', 16)
      .type('01')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.showMask')
      .should('have.value', '+_ (___) ___-__-__')
      .type('12345678901')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89-0_')
      .and('have.prop', 'selectionStart', 17)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89-__')
      .and('have.prop', 'selectionStart', 15)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '+1 (234) 5__-__-__')
      .and('have.prop', 'selectionStart', 10)
      .type('{backspace}')
      .should('have.value', '+1 (234) ___-__-__')
      .and('have.prop', 'selectionStart', 7)
      .type('{backspace}{backspace}')
      .should('have.value', '+1 (2__) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}')
      .should('have.value', '+1 (___) ___-__-__')
      .and('have.prop', 'selectionStart', 2)
      .type('{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1);
  });

  it('should correctly apply mask for typed characters if some characters are present after cursor', () => {
    cy.get('input.showMask')
      .should('have.value', '+_ (___) ___-__-__')
      .type('123')
      .should('have.value', '+1 (23_) ___-__-__')
      .and('have.prop', 'selectionStart', 6)
      .type('{leftarrow}{leftarrow}4')
      .should('have.value', '+1 (423) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('56')
      .should('have.value', '+1 (456) 23_-__-__')
      .and('have.prop', 'selectionStart', 9)
      .type('78')
      .should('have.value', '+1 (456) 782-3_-__')
      .and('have.prop', 'selectionStart', 11)
      .type('9')
      .should('have.value', '+1 (456) 789-23-__')
      .and('have.prop', 'selectionStart', 13)
      .type('01')
      .should('have.value', '+1 (456) 789-01-23')
      .and('have.prop', 'selectionStart', 16);
  });

  it('should correctly apply mask for deleted characters if some characters are present after cursor', () => {
    cy.get('input.showMask')
      .should('have.value', '+_ (___) ___-__-__')
      .type('12345678901')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}')
      .should('have.value', '+1 (234) 567-90-1_')
      .and('have.prop', 'selectionStart', 12)
      .type('{backspace}')
      .should('have.value', '+1 (234) 569-01-__')
      .and('have.prop', 'selectionStart', 11)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '+1 (290) 1__-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{del}')
      .should('have.value', '+1 (201) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{del}{del}{del}')
      .should('have.value', '+1 (2__) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}{backspace}{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1);
  });
});

describe('Input with showMask and allowed mask symbols', () => {
  afterEach(() => {
    cy.get('input.showMaskSymbols').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.showMaskSymbols')
      .should('have.value', '+_ (___) ___-__-__')
      .type('+ ')
      .should('have.value', '++ ( __) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('())(')
      .should('have.value', '++ ( ()) )(_-__-__')
      .and('have.prop', 'selectionStart', 11)
      .type('--+ -')
      .should('have.value', '++ ( ()) )(---+- -')
      .and('have.prop', 'selectionStart', 18);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.showMaskSymbols')
      .should('have.value', '+_ (___) ___-__-__')
      .type('+ ())(--+ -')
      .should('have.value', '++ ( ()) )(---+- -')
      .and('have.prop', 'selectionStart', 18)
      .type('{backspace}')
      .should('have.value', '++ ( ()) )(---+- _')
      .and('have.prop', 'selectionStart', 17)
      .type('{backspace}')
      .should('have.value', '++ ( ()) )(---+-__')
      .and('have.prop', 'selectionStart', 15)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '++ ( ()) )__-__-__')
      .and('have.prop', 'selectionStart', 10)
      .type('{backspace}')
      .should('have.value', '++ ( ()) ___-__-__')
      .and('have.prop', 'selectionStart', 7)
      .type('{backspace}{backspace}')
      .should('have.value', '++ ( __) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}')
      .should('have.value', '++ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 2)
      .type('{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1);
  });

  it('should correctly apply mask for typed characters if some characters are present after cursor', () => {
    cy.get('input.showMaskSymbols')
      .should('have.value', '+_ (___) ___-__-__')
      .type('+ (')
      .should('have.value', '++ ( (_) ___-__-__')
      .and('have.prop', 'selectionStart', 6)
      .type('{leftarrow}{leftarrow})')
      .should('have.value', '++ () () ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type(')(')
      .should('have.value', '++ ())()  (_-__-__')
      .and('have.prop', 'selectionStart', 9)
      .type('(-')
      .should('have.value', '++ ())() (- -(_-__')
      .and('have.prop', 'selectionStart', 11)
      .type('-')
      .should('have.value', '++ ())() (--- (-__')
      .and('have.prop', 'selectionStart', 13)
      .type(' -')
      .should('have.value', '++ ())() (--- -- (')
      .and('have.prop', 'selectionStart', 16);
  });

  it('should correctly apply mask for deleted characters if some characters are present after cursor', () => {
    cy.get('input.showMaskSymbols')
      .should('have.value', '+_ (___) ___-__-__')
      .type('+ ())(--+ -')
      .should('have.value', '++ ( ()) )(---+- -')
      .and('have.prop', 'selectionStart', 18)
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}')
      .should('have.value', '++ ( ()) )(--+ --_')
      .and('have.prop', 'selectionStart', 12)
      .type('{backspace}')
      .should('have.value', '++ ( ()) )(+- --__')
      .and('have.prop', 'selectionStart', 11)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '++ ( + ) -__-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{del}')
      .should('have.value', '++ (  -) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{del}{del}{del}')
      .should('have.value', '++ ( __) ___-__-__')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}{backspace}{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 1);
  });
});

describe('Input with partial showMask and allowed mask symbols', () => {
  afterEach(() => {
    cy.get('input.showMaskPart').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.showMaskPart')
      .should('have.value', ' _ [___]')
      .type('a')
      .should('have.value', ' a [___]')
      .and('have.prop', 'selectionStart', 4)
      .type('12')
      .should('have.value', ' a [12_]')
      .and('have.prop', 'selectionStart', 6)
      .type('3')
      .should('have.value', ' a [123] [')
      .and('have.prop', 'selectionStart', 10)
      .type('$% ')
      .should('have.value', ' a [123] [$% ] [')
      .and('have.prop', 'selectionStart', 16)
      .type('[]')
      .should('have.value', ' a [123] [$% ] [[]]')
      .and('have.prop', 'selectionStart', 19);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.showMaskPart')
      .should('have.value', ' _ [___]')
      .type('a123$% []')
      .should('have.value', ' a [123] [$% ] [[]]')
      .and('have.prop', 'selectionStart', 19)
      .type('{backspace}')
      .should('have.value', ' a [123] [$% ] [[]')
      .and('have.prop', 'selectionStart', 18)
      .type('{backspace}')
      .should('have.value', ' a [123] [$% ] [[')
      .and('have.prop', 'selectionStart', 17)
      .type('{backspace}')
      .should('have.value', ' a [123] [$% ')
      .and('have.prop', 'selectionStart', 13)
      .type('{backspace}{backspace}')
      .should('have.value', ' a [123] [$')
      .and('have.prop', 'selectionStart', 11)
      .type('{backspace}')
      .should('have.value', ' a [123]')
      .and('have.prop', 'selectionStart', 7)
      .type('{backspace}{backspace}')
      .should('have.value', ' a [1__]')
      .and('have.prop', 'selectionStart', 5)
      .type('{backspace}')
      .should('have.value', ' a [___]')
      .and('have.prop', 'selectionStart', 2)
      .type('{backspace}')
      .should('have.value', ' _ [___]')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', ' _ [___]')
      .and('have.prop', 'selectionStart', 1);
  });

  it('should correctly apply mask for typed characters if some characters are present after cursor', () => {
    cy.get('input.showMaskPart')
      .should('have.value', ' _ [___]')
      .type('a12')
      .should('have.value', ' a [12_]')
      .and('have.prop', 'selectionStart', 6)
      .type('{leftarrow}{leftarrow}3')
      .should('have.value', ' a [312] [')
      .and('have.prop', 'selectionStart', 5)
      .type('$% ')
      .should('have.value', ' a [3$%] [ 12] [')
      .and('have.prop', 'selectionStart', 11)
      .type('[]')
      .should('have.value', ' a [3$%] [ []] [12]')
      .and('have.prop', 'selectionStart', 16);
  });

  it('should correctly apply mask for deleted characters if some characters are present after cursor', () => {
    cy.get('input.showMaskPart')
      .should('have.value', ' _ [___]')
      .type('a123$% []')
      .should('have.value', ' a [123] [$% ] [[]]')
      .and('have.prop', 'selectionStart', 19)
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{backspace}')
      .should('have.value', ' a [123] [% [] []')
      .and('have.prop', 'selectionStart', 7)
      .type('{backspace}')
      .should('have.value', ' a [12%] [ []')
      .and('have.prop', 'selectionStart', 6)
      .type('{del}{del}')
      .should('have.value', ' a [12[] []')
      .and('have.prop', 'selectionStart', 6)
      .type('{del}')
      .should('have.value', ' a [12]]')
      .and('have.prop', 'selectionStart', 6)
      .type('{del}')
      .should('have.value', ' a [12_]')
      .and('have.prop', 'selectionStart', 6)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', ' _ [___]')
      .and('have.prop', 'selectionStart', 1);
  });
});

describe('Input with showMask and regex mask', () => {
  afterEach(() => {
    cy.get('input.regex').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.regex')
      .should('have.value', '** ***-**')
      .type('1A')
      .should('have.value', 'A* ***-**')
      .and('have.prop', 'selectionStart', 1)
      .type('bB54')
      .should('have.value', 'AB 4**-**')
      .and('have.prop', 'selectionStart', 4)
      .type('5a6')
      .should('have.value', 'AB 456-**')
      .and('have.prop', 'selectionStart', 7)
      .type('1Aa1')
      .should('have.value', 'AB 456-a1')
      .and('have.prop', 'selectionStart', 9);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.regex')
      .should('have.value', '** ***-**')
      .type('AB456a1')
      .should('have.value', 'AB 456-a1')
      .and('have.prop', 'selectionStart', 9)
      .type('{backspace}')
      .should('have.value', 'AB 456-a*')
      .and('have.prop', 'selectionStart', 8)
      .type('{backspace}')
      .should('have.value', 'AB 456-**')
      .and('have.prop', 'selectionStart', 6)
      .type('{backspace}{backspace}')
      .should('have.value', 'AB 4**-**')
      .and('have.prop', 'selectionStart', 4)
      .type('{backspace}')
      .should('have.value', 'AB ***-**')
      .and('have.prop', 'selectionStart', 2)
      .type('{backspace}')
      .should('have.value', 'A* ***-**')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', '** ***-**')
      .and('have.prop', 'selectionStart', 0)
      .type('{backspace}')
      .should('have.value', '** ***-**')
      .and('have.prop', 'selectionStart', 0);
  });

  it('should correctly apply mask for typed characters if some characters are present after cursor', () => {
    cy.get('input.regex')
      .should('have.value', '** ***-**')
      .type('1A')
      .should('have.value', 'A* ***-**')
      .and('have.prop', 'selectionStart', 1)
      .type('bB54')
      .should('have.value', 'AB 4**-**')
      .and('have.prop', 'selectionStart', 4)
      .type('{leftarrow}{leftarrow}5a61')
      .should('have.value', 'AB 14*-**')
      .and('have.prop', 'selectionStart', 4)
      .type('2Aa3')
      .should('have.value', 'AB 123-**')
      .and('have.prop', 'selectionStart', 7)
      .type('a1')
      .should('have.value', 'AB 123-a1')
      .and('have.prop', 'selectionStart', 9);
  });

  it('should correctly apply mask for deleted characters if some characters are present after cursor', () => {
    cy.get('input.regex')
      .should('have.value', '** ***-**')
      .type('AB456a1')
      .should('have.value', 'AB 456-a1')
      .and('have.prop', 'selectionStart', 9)
      .type('{backspace}')
      .should('have.value', 'AB 456-a*')
      .and('have.prop', 'selectionStart', 8)
      .type('{backspace}')
      .should('have.value', 'AB 456-**')
      .and('have.prop', 'selectionStart', 6)
      .type('{leftarrow}{leftarrow}{del}')
      .should('have.value', 'AB 46*-**')
      .and('have.prop', 'selectionStart', 4)
      .type('{leftarrow}{leftarrow}{leftarrow}{del}')
      .should('have.value', 'A* ***-**')
      .and('have.prop', 'selectionStart', 1)
      .type('{backspace}')
      .should('have.value', '** ***-**')
      .and('have.prop', 'selectionStart', 0)
      .type('{backspace}')
      .should('have.value', '** ***-**')
      .and('have.prop', 'selectionStart', 0);
  });
});
