/* eslint-disable spaced-comment */
/// <reference types="cypress" />

before(() => {
  cy.visit('http://127.0.0.1:5500/example/example.html');
});

describe('Simple input', () => {
  afterEach(() => {
    cy.get('input')[0].clear();
  });
  it('should correctly apply mask for simple typing', () => {
    cy.get('input')[0]
      .type('123')
      .should('have.value', '123')
      .type('4')
      .should('have.value', '123-4')
      .type('5')
      .should('have.value', '123-45')
      .type('6')
      .should('have.value', '123-45-6')
      .type('7')
      .should('have.value', '123-45-67');
  });

  it('should not allow to add more symbols after mask is complete', () => {
    cy.get('input')[0]
      .type('123-45-67')
      .should('have.value', '123-45-67')
      .type('1')
      .should('have.value', '123-45-67')
      .type('{leftarrow}1')
      .should('have.value', '123-45-67');
  });
});
