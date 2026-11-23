import './commands';

// O Sauce Demo lança erros de JavaScript propositalmente em alguns perfis (ex.: error_user).
// Esses erros não devem interromper o teste: o que se avalia é o comportamento visível na tela.
Cypress.on('uncaught:exception', () => false);
