export const SENHA = 'secret_sauce';

export const PRODUTOS = [
  'sauce-labs-backpack',
  'sauce-labs-bike-light',
  'sauce-labs-bolt-t-shirt',
  'sauce-labs-fleece-jacket',
  'sauce-labs-onesie',
  'test.allthethings()-t-shirt-(red)',
];

/** Abre a tela de login e autentica com o usuário informado. */
Cypress.Commands.add('login', (usuario, senha = SENHA) => {
  cy.visit('/');
  cy.get('#user-name').type(usuario);
  cy.get('#password').type(senha, { log: false });
  cy.get('#login-button').click();
});

/** Abre o menu lateral e faz logout. */
Cypress.Commands.add('logout', () => {
  cy.get('#react-burger-menu-btn').click();
  cy.get('#logout_sidebar_link').click();
});

/** Botões de adicionar/remover de um produto (o id pode ter caracteres especiais). */
Cypress.Commands.add('botaoAdicionar', (slug) => cy.get(`[id="add-to-cart-${slug}"]`));
Cypress.Commands.add('botaoRemover', (slug) => cy.get(`[id="remove-${slug}"]`));

/** Do inventário até a tela "Checkout: Your Information". */
Cypress.Commands.add('irParaCheckout', () => {
  cy.get('.shopping_cart_link').click();
  cy.get('#checkout').click();
});

/** Preenche os dados do comprador (campos vazios são ignorados) e clica em Continue. */
Cypress.Commands.add('preencherDados', ({ nome = '', sobrenome = '', cep = '' } = {}) => {
  if (nome) cy.get('#first-name').type(nome);
  if (sobrenome) cy.get('#last-name').type(sobrenome);
  if (cep) cy.get('#postal-code').type(cep);
  cy.get('#continue').click();
});
