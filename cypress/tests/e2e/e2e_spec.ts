describe('E2E test', () => {
  it('successfully loads and performs e2e test', () => {
    cy.visit('/');

    cy.dataCy('title').contains('Take a trip');

    cy.dataCy('sign-in-btn').click();

    cy.url().should('include', '/auth');

    cy.get('#input-username-for-credentials-provider').type('username');

    cy.get('#input-password-for-credentials-provider').type('password{enter}');

    cy.url().should('equal', 'http://localhost:3000/');

    cy.contains('Dashboard').click();

    cy.url().should('equal', 'http://localhost:3000/dashboard');

    cy.dataCy('new-review-btn').click();

    cy.get('#location').type('B');

    cy.get('[data-reach-combobox-list] li:first-child').click();

    cy.get('#comment').type('Great city!');

    cy.dataCy('add-review-btn').click();

    cy.url().should('include', '/place');

    cy.contains('Great city!');

    cy.dataCy('sign-out-btn').click();

    cy.url().should('equal', 'http://localhost:3000/');
  });
});
