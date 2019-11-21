// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

// No way to test true text pasting aside from maybe this: https://github.com/cypress-io/cypress/issues/2752
// Also no way to select text in input for deleting multiple symbols ('should correctly parse multiple deleted characters') except maybe this: https://gist.github.com/erquhart/37bf2d938ab594058e0572ed17d3837a
// TODO: test del
// TODO: test CTRL+backspace
// TODO: tests for showMaskSymbol input (currently broken)
// TODO: deletion in the middle for regex input

before(() => {
  cy.visit('http://127.0.0.1:5500/example/example.html');
});

describe('Simple input', () => {
  afterEach(() => {
    cy.get('input.simple').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.simple')
      .should('have.value', '')
      .type('123')
      .should('have.value', '123-')
      .and('have.prop', 'selectionStart', 4)
      .and('have.prop', 'selectionEnd', 4)
      .type('4')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('5')
      .should('have.value', '123-45-')
      .and('have.prop', 'selectionStart', 7)
      .and('have.prop', 'selectionEnd', 7)
      .type('6')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8)
      .type('7')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.simple')
      .type('1234567')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .type('{backspace}')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8)
      .type('{backspace}')
      .should('have.value', '123-45')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('{backspace}')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('{backspace}')
      .should('have.value', '123')
      .and('have.prop', 'selectionStart', 3)
      .and('have.prop', 'selectionEnd', 3)
      .type('{backspace}{backspace}')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .and('have.prop', 'selectionEnd', 1);
  });

  it('should correctly move values if after cursor some characters are present', () => {
    cy.get('input.simple')
      .type('12')
      .should('have.value', '12')
      .and('have.prop', 'selectionStart', 2)
      .and('have.prop', 'selectionEnd', 2)
      .type('{leftarrow}{leftarrow}3')
      .should('have.value', '312-')
      .and('have.prop', 'selectionStart', 1)
      .and('have.prop', 'selectionEnd', 1)
      .type('4')
      .should('have.value', '341-2')
      .and('have.prop', 'selectionStart', 2)
      .and('have.prop', 'selectionEnd', 2)
      .type('56')
      .should('have.value', '345-61-2')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('7')
      .should('have.value', '345-67-12')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('{backspace}')
      .should('have.value', '345-61-2')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('{backspace}')
      .should('have.value', '345-12')
      .and('have.prop', 'selectionStart', 4)
      .and('have.prop', 'selectionEnd', 4)
      .type('{backspace}{backspace}')
      .should('have.value', '341-2')
      .and('have.prop', 'selectionStart', 2)
      .and('have.prop', 'selectionEnd', 2)
      .type('{backspace}{backspace}{backspace}')
      .should('have.value', '12')
      .and('have.prop', 'selectionStart', 0)
      .and('have.prop', 'selectionEnd', 0);
  });

  it('should not allow to add more characters after mask is complete', () => {
    cy.get('input.simple')
      .type('123456')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8)
      .type('71')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .type('{leftarrow}1')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8);
  });

  it('should not allow to paste unsupported symbols', () => {
    cy.get('input.simple')
      .type('1')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .and('have.prop', 'selectionEnd', 1)
      .type('a')
      .should('have.value', '1')
      .and('have.prop', 'selectionStart', 1)
      .and('have.prop', 'selectionEnd', 1)
      .type('2c3&4')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('{leftarrow}{leftarrow}{leftarrow}c5G')
      .should('have.value', '125-34-')
      .and('have.prop', 'selectionStart', 3)
      .and('have.prop', 'selectionEnd', 3);
  });

  it('should correctly parse multiple pasted characters', () => {
    cy.get('input.simple')
      .invoke('val', '123')
      .trigger('input')
      .should('have.value', '123-')
      .and('have.prop', 'selectionStart', 4)
      .and('have.prop', 'selectionEnd', 4)
      .clear()
      .invoke('val', '1234567')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .clear()
      .invoke('val', '123-45-67')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .clear()
      .invoke('val', '123-456-7')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .clear()
      .invoke('val', '-a-12-3&-45$6-G7')
      .trigger('input')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9);
  });
});

describe('showMask input', () => {
  afterEach(() => {
    cy.get('input.showMask').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.showMask')
      .should('have.value', '+_ (___) ___-__-__')
      .type('123')
      .should('have.value', '+1 (23_) ___-__-__')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('4')
      .should('have.value', '+1 (234) ___-__-__')
      .and('have.prop', 'selectionStart', 7)
      .and('have.prop', 'selectionEnd', 7)
      .type('567')
      .should('have.value', '+1 (234) 567-__-__')
      .and('have.prop', 'selectionStart', 12)
      .and('have.prop', 'selectionEnd', 12)
      .type('89')
      .should('have.value', '+1 (234) 567-89-__')
      .and('have.prop', 'selectionStart', 15)
      .and('have.prop', 'selectionEnd', 15)
      .type('01')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .and('have.prop', 'selectionEnd', 18);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.showMask')
      .type('12345678901')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .and('have.prop', 'selectionEnd', 18)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89-0_')
      .and('have.prop', 'selectionStart', 17)
      .and('have.prop', 'selectionEnd', 17)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89-__')
      .and('have.prop', 'selectionStart', 15)
      .and('have.prop', 'selectionEnd', 15)
      .type('{backspace}{backspace}{backspace}')
      .should('have.value', '+1 (234) 56_-__-__')
      .and('have.prop', 'selectionStart', 11)
      .and('have.prop', 'selectionEnd', 11)
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '+_ (___) ___-__-__')
      .and('have.prop', 'selectionStart', 0) // should be 1
      .and('have.prop', 'selectionEnd', 0);
  });

  it('should correctly place cursor after character input', () => {
    cy.get('input.showMask')
      .type('123456')
      .should('have.value', '+1 (234) 56_-__-__')
      .and('have.prop', 'selectionStart', 11)
      .and('have.prop', 'selectionEnd', 11)
      .type('{rightarrow}{rightarrow}{rightarrow}')
      .should('have.value', '+1 (234) 56_-__-__')
      .and('have.prop', 'selectionStart', 14)
      .and('have.prop', 'selectionEnd', 14)
      .type('7')
      .should('have.value', '+1 (234) 567-__-__')
      .and('have.prop', 'selectionStart', 12)
      .and('have.prop', 'selectionEnd', 12)
      .type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}')
      .should('have.value', '+1 (234) 567-__-__')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8)
      .type('8')
      .should('have.value', '+1 (234) 856-7_-__')
      .and('have.prop', 'selectionStart', 10)
      .and('have.prop', 'selectionEnd', 10);
  });
});

describe('showMaskPart input', () => {
  afterEach(() => {
    cy.get('input.showMaskPart').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.showMaskPart')
      .should('have.value', '+_ (___) ')
      .type('123')
      .should('have.value', '+1 (23_) ')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('4')
      .should('have.value', '+1 (234) ')
      .and('have.prop', 'selectionStart', 7) // should be 9
      .and('have.prop', 'selectionEnd', 7)
      .type('567')
      .should('have.value', '+1 (234) 567-')
      .and('have.prop', 'selectionStart', 13)
      .and('have.prop', 'selectionEnd', 13)
      .type('8')
      .should('have.value', '+1 (234) 567-8')
      .and('have.prop', 'selectionStart', 14)
      .and('have.prop', 'selectionEnd', 14)
      .type('9')
      .should('have.value', '+1 (234) 567-89-')
      .and('have.prop', 'selectionStart', 16)
      .and('have.prop', 'selectionEnd', 16)
      .type('01')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .and('have.prop', 'selectionEnd', 18);
  });

  it('should correctly apply mask for deleted characters', () => {
    cy.get('input.showMaskPart')
      .type('12345678901')
      .should('have.value', '+1 (234) 567-89-01')
      .and('have.prop', 'selectionStart', 18)
      .and('have.prop', 'selectionEnd', 18)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89-0')
      .and('have.prop', 'selectionStart', 17)
      .and('have.prop', 'selectionEnd', 17)
      .type('{backspace}')
      .should('have.value', '+1 (234) 567-89')
      .and('have.prop', 'selectionStart', 15)
      .and('have.prop', 'selectionEnd', 15)
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '+1 (234) ')
      .and('have.prop', 'selectionStart', 7) // should be 9
      .and('have.prop', 'selectionEnd', 7)
      .type('{backspace}{backspace}{backspace}{backspace}')
      .should('have.value', '+_ (___) ')
      .and('have.prop', 'selectionStart', 0) // should be 1
      .and('have.prop', 'selectionEnd', 0);
  });
});

describe('showMaskSymbols input', () => {
  afterEach(() => {
    cy.get('input.showMaskSymbols').clear();
  });

  // it('should correctly apply mask for typed characters', () => {
  //   cy.get('input.showMaskSymbols')
  //     .should('have.value', '+_ (___) ___-__-__')
  //     .type('+ ')
  //     .should('have.value', '++ ( __) ___-__-__')
  //     .and('have.prop', 'selectionStart', 5)
  //     .and('have.prop', 'selectionEnd', 5)
  //     .type('())(')
  //     .should('have.value', '++ ( ()) )(_-__-__')
  //     .and('have.prop', 'selectionStart', 1)
  //     .and('have.prop', 'selectionEnd', 1)
  //     .type('--+ -')
  //     .should('have.value', '++ ( ()) )(---+- -')
  //     .and('have.prop', 'selectionStart', 18)
  //     .and('have.prop', 'selectionEnd', 18);
  // });

  // it('should correctly apply mask for deleted characters', () => {
  //   cy.get('input.showMaskSymbols')
  //     .type('12345678901')
  //     .should('have.value', '+1 (234) 567-89-01')
  //     .and('have.prop', 'selectionStart', 18)
  //     .and('have.prop', 'selectionEnd', 18)
  //     .type('{backspace}')
  //     .should('have.value', '+1 (234) 567-89-0_')
  //     .and('have.prop', 'selectionStart', 17)
  //     .and('have.prop', 'selectionEnd', 17)
  //     .type('{backspace}')
  //     .should('have.value', '+1 (234) 567-89-__')
  //     .and('have.prop', 'selectionStart', 16)
  //     .and('have.prop', 'selectionEnd', 16)
  //     .type('{backspace}{backspace}{backspace}{backspace}{backspace}')
  //     .should('have.value', '+1 (234) 56_-__-__')
  //     .and('have.prop', 'selectionStart', 11)
  //     .and('have.prop', 'selectionEnd', 11)
  //     .type(
  //       '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}'
  //     )
  //     .should('have.value', '+_ (___) ___-__-__')
  //     .and('have.prop', 'selectionStart', 1)
  //     .and('have.prop', 'selectionEnd', 1);
  // });
});

describe('regex input', () => {
  afterEach(() => {
    cy.get('input.regex').clear();
  });

  it('should correctly apply mask for typed characters', () => {
    cy.get('input.regex')
      .should('have.value', '** ***-**')
      .type('1A')
      .should('have.value', 'A* ***-**')
      .and('have.prop', 'selectionStart', 1)
      .and('have.prop', 'selectionEnd', 1)
      .type('bB54')
      .should('have.value', 'AB 4**-**')
      .and('have.prop', 'selectionStart', 4)
      .and('have.prop', 'selectionEnd', 4)
      .type('5a6')
      .should('have.value', 'AB 456-**')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('1Aa1')
      .should('have.value', 'AB 456-a1')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9);
  });
});
