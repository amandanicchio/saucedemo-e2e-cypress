// RF03 – Carrinho de Compras
// O sistema deve permitir adicionar e remover produtos do carrinho, manter o indicador de
// quantidade atualizado e preservar o conteúdo do carrinho durante a navegação, de forma
// isolada para cada usuário.
import { PRODUTOS } from '../support/commands';

const badge = () => cy.get('.shopping_cart_badge');
const itensCarrinho = () => cy.get('.cart_item');
const adicionarTodos = () => PRODUTOS.forEach((p) => cy.botaoAdicionar(p).click());

describe('RF03 – Carrinho de Compras', () => {

  context('Cenário 3.1 – Adição de produtos ao carrinho', () => {
    it('CT022 – Adicionar um produto ao carrinho', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.botaoRemover('sauce-labs-backpack').should('have.text', 'Remove');
      badge().should('have.text', '1');
      cy.get('.shopping_cart_link').click();
      itensCarrinho().should('have.length', 1)
        .find('.inventory_item_name').should('have.text', 'Sauce Labs Backpack');
    });

    it('CT023 – Adicionar todos os produtos ao carrinho', () => {
      cy.login('standard_user');
      adicionarTodos();
      badge().should('have.text', '6');
      cy.get('.shopping_cart_link').click();
      itensCarrinho().should('have.length', 6);
    });

    [['CT024', 'problem_user'], ['CT025', 'error_user']].forEach(([ct, usuario]) => {
      it(`${ct} – Adicionar todos os produtos com ${usuario}`, () => {
        cy.login(usuario);
        adicionarTodos();
        cy.contains('.inventory_item button', 'Add to cart').should('not.exist');
        badge().should('have.text', '6');
      });
    });
  });

  context('Cenário 3.2 – Remoção de produtos do carrinho', () => {
    it('CT026 – Remover produto pela página do carrinho', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.get('.shopping_cart_link').click();
      cy.botaoRemover('sauce-labs-backpack').click();
      itensCarrinho().should('not.exist');
      badge().should('not.exist');
    });

    it('CT027 – Remover produto pela página de inventário', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.botaoRemover('sauce-labs-backpack').click();
      cy.botaoAdicionar('sauce-labs-backpack').should('have.text', 'Add to cart');
      badge().should('not.exist');
    });

    it('CT028 – Remover um entre vários produtos', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.botaoAdicionar('sauce-labs-bike-light').click();
      cy.get('.shopping_cart_link').click();
      cy.botaoRemover('sauce-labs-bike-light').click();
      itensCarrinho().should('have.length', 1)
        .find('.inventory_item_name').should('have.text', 'Sauce Labs Backpack');
      badge().should('have.text', '1');
    });

    [['CT029', 'problem_user'], ['CT030', 'error_user']].forEach(([ct, usuario]) => {
      it(`${ct} – Remover produto com ${usuario}`, () => {
        cy.login(usuario);
        cy.botaoAdicionar('sauce-labs-backpack').click();
        badge().should('have.text', '1');
        cy.botaoRemover('sauce-labs-backpack').click();
        cy.get('[id="add-to-cart-sauce-labs-backpack"]').should('have.text', 'Add to cart');
        badge().should('not.exist');
      });
    });
  });

  context('Cenário 3.3 – Persistência e isolamento do carrinho', () => {
    it('CT031 – Manutenção dos itens ao navegar e recarregar', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.botaoAdicionar('sauce-labs-bike-light').click();
      cy.contains('.inventory_item_name', 'Sauce Labs Onesie').click();
      cy.get('#back-to-products').click();
      cy.reload();
      cy.get('.shopping_cart_link').click();
      itensCarrinho().should('have.length', 2);
      badge().should('have.text', '2');
    });

    it('CT032 – Isolamento do carrinho entre usuários', () => {
      cy.login('standard_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      badge().should('have.text', '1');
      cy.logout();
      cy.login('problem_user');
      cy.get('.shopping_cart_link').click();
      itensCarrinho().should('not.exist'); // carrinho do problem_user deveria estar vazio
    });
  });
});
