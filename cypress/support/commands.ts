// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

// Call it with cy.login()
Cypress.Commands.add('login', (overrides = {}) => {
  Cypress.log({
    name: 'loginWithUsernameAndPassword',
  });

  // TODO: Implement login
  const { username, password } = overrides;
  //const token = await getCsrfToken();
  const options = {
    method: 'POST',
    url: '/api/auth/signin/credentials',
    body: {
      username: username || Cypress.env('auth_username'),
      password: password || Cypress.env('auth_password'),
      // csrf token
    },
  };

  cy.request(options);
});

export {};
