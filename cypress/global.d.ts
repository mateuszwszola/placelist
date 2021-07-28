/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    dataCy(value: string): Chainable<Element>;

    /**
     * Logs-in user by using UI
     * @example cy.login({ username: 'username', password: 'password' })
     */
    login(overrides?: { username: string; password: string }): void;

    /**
     * Custom command to programmatically log in.
     * @example cy.loginByApi({ username: 'username', password: 'password' })
     */
    loginByApi(overrides?: { username: string; password: string }): Chainable<Element>;
  }
}
