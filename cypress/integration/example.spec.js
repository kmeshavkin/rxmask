// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

before(() => {
  cy.visit('http://127.0.0.1:5500/example/example.html');
});

describe('Simple input', () => {
  afterEach(() => {
    cy.get('input.simple').clear();
  });
  it('should correctly apply mask for simple typing', () => {
    cy.get('input.simple')
      .type('123')
      .should('have.value', '123')
      .and('have.prop', 'selectionStart', 3)
      .and('have.prop', 'selectionEnd', 3)
      .type('4')
      .should('have.value', '123-4')
      .and('have.prop', 'selectionStart', 5)
      .and('have.prop', 'selectionEnd', 5)
      .type('5')
      .should('have.value', '123-45')
      .and('have.prop', 'selectionStart', 6)
      .and('have.prop', 'selectionEnd', 6)
      .type('6')
      .should('have.value', '123-45-6')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8)
      .type('7')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9);
  });

  it('should not allow to add more symbols after mask is complete', () => {
    cy.get('input.simple')
      .type('1234567')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .type('1')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 9)
      .and('have.prop', 'selectionEnd', 9)
      .type('{leftarrow}1')
      .should('have.value', '123-45-67')
      .and('have.prop', 'selectionStart', 8)
      .and('have.prop', 'selectionEnd', 8);
  });

  it('should correctly parse pasted values', () => {
    cy.get('input.simple')
      .invoke('val', '123')
      .trigger('input')
      .should('have.value', '123')
      .and('have.prop', 'selectionStart', 3)
      .and('have.prop', 'selectionEnd', 3)
      .type('{leftarrow}{leftarrow}')
      .invoke('val', '12345')
      .trigger('input')
      .and('have.prop', 'selectionStart', 3)
      .and('have.prop', 'selectionEnd', 3); // paste doesn't work
  });
});
