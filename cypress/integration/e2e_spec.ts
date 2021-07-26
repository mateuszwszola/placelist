describe('My first E2E test', () => {
  it('successfully loads and performs e2e test', () => {
    cy.visit('/');

    cy.get('[data-cy=title]').contains('Take a trip');

    cy.get('[data-cy=sign-in-btn]').click();

    cy.url().should('include', '/auth');

    cy.get('#input-username-for-credentials-provider').type('username');

    cy.get('#input-password-for-credentials-provider').type('password{enter}');

    cy.url().should('equal', 'http://localhost:3000/');

    cy.contains('Dashboard').click();

    cy.url().should('equal', 'http://localhost:3000/dashboard');

    cy.get('[data-cy=new-review-btn]').click();

    cy.get('#location').type('B');

    cy.get('[data-reach-combobox-list] li:first-child').click();

    cy.get('#comment').type('Nice city!');

    cy.get('[data-cy=add-review-btn]').click();

    cy.url().should('include', '/place');

    cy.contains('Nice city!');

    cy.get('[data-cy=sign-out-btn]').click();

    cy.url().should('equal', 'http://localhost:3000/');
  });
});

export {};
