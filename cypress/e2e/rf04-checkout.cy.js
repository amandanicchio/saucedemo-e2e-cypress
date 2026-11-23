// RF04 – Checkout
// O sistema deve permitir a finalização da compra mediante o preenchimento obrigatório de
// First Name, Last Name e Zip/Postal Code, exibir o resumo do pedido com subtotal, imposto e
// total corretos e confirmar a conclusão da compra.
const DADOS = { nome: 'Amanda', sobrenome: 'Nicchio', cep: '29100' };
const erro = () => cy.get('[data-test="error"]');

/** Login + produto(s) no carrinho + tela "Checkout: Your Information". */
function prepararCheckout(usuario = 'standard_user', produtos = ['sauce-labs-backpack']) {
  cy.login(usuario);
  produtos.forEach((p) => cy.botaoAdicionar(p).click());
  cy.irParaCheckout();
  cy.get('.title').should('have.text', 'Checkout: Your Information');
}

describe('RF04 – Checkout', () => {

  context('Cenário 4.1 – Preenchimento dos dados do comprador', () => {
    it('CT033 – Checkout com todos os campos preenchidos', () => {
      prepararCheckout();
      cy.preencherDados(DADOS);
      cy.get('.title').should('have.text', 'Checkout: Overview');
    });

    [
      ['CT034', 'sem First Name', { sobrenome: 'Nicchio', cep: '29100' }, 'Error: First Name is required'],
      ['CT035', 'sem Last Name', { nome: 'Amanda', cep: '29100' }, 'Error: Last Name is required'],
      ['CT036', 'sem Zip/Postal Code', { nome: 'Amanda', sobrenome: 'Nicchio' }, 'Error: Postal Code is required'],
      ['CT037', 'com todos os campos vazios', {}, 'Error: First Name is required'],
    ].forEach(([ct, titulo, dados, mensagem]) => {
      it(`${ct} – Checkout ${titulo}`, () => {
        prepararCheckout();
        cy.preencherDados(dados);
        erro().should('have.text', mensagem);
        cy.url().should('include', 'checkout-step-one');
      });
    });

    it('CT038 – Checkout com Zip/Postal Code contendo letras', () => {
      prepararCheckout();
      cy.preencherDados({ nome: 'Amanda', sobrenome: 'Nicchio', cep: 'ABCDE' });
      cy.url().should('include', 'checkout-step-one'); // o sistema deveria rejeitar letras no CEP
      erro().should('be.visible');
    });

    [['CT039', 'problem_user'], ['CT040', 'error_user']].forEach(([ct, usuario]) => {
      it(`${ct} – Preenchimento do Last Name com ${usuario}`, () => {
        prepararCheckout(usuario);
        cy.get('#first-name').type('Amanda');
        cy.get('#last-name').type('Nicchio');
        cy.get('#first-name').should('have.value', 'Amanda');
        cy.get('#last-name').should('have.value', 'Nicchio');
      });
    });
  });

  context('Cenário 4.2 – Resumo do pedido', () => {
    beforeEach(() => {
      prepararCheckout('standard_user', ['sauce-labs-backpack', 'sauce-labs-bike-light']);
      cy.preencherDados(DADOS);
    });

    it('CT041 – Conferência dos itens do pedido', () => {
      cy.get('.cart_item').should('have.length', 2);
      cy.get('.cart_item .inventory_item_name').then(($n) => {
        expect([...$n].map((e) => e.innerText)).to.deep.equal(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
      });
      cy.get('.cart_item .cart_quantity').each(($q) => expect($q.text()).to.equal('1'));
      cy.get('.cart_item .inventory_item_price').then(($p) => {
        expect([...$p].map((e) => e.innerText)).to.deep.equal(['$29.99', '$9.99']);
      });
    });

    it('CT042 – Cálculo de subtotal, imposto e total', () => {
      cy.get('.summary_subtotal_label').should('have.text', 'Item total: $39.98');
      cy.get('.summary_tax_label').should('have.text', 'Tax: $3.20');
      cy.get('.summary_total_label').should('have.text', 'Total: $43.18');
    });
  });

  context('Cenário 4.3 – Conclusão e cancelamento do pedido', () => {
    it('CT043 – Fluxo completo de compra', () => {
      prepararCheckout();
      cy.preencherDados(DADOS);
      cy.get('#finish').click();
      cy.get('.title').should('have.text', 'Checkout: Complete!');
      cy.get('.complete-header').should('have.text', 'Thank you for your order!');
      cy.get('.shopping_cart_badge').should('not.exist');
    });

    it('CT044 – Retorno à listagem após a compra', () => {
      prepararCheckout();
      cy.preencherDados(DADOS);
      cy.get('#finish').click();
      cy.get('#back-to-products').click();
      cy.url().should('include', 'inventory.html');
      cy.contains('.inventory_item button', 'Remove').should('not.exist');
      cy.get('.shopping_cart_badge').should('not.exist');
    });

    it('CT045 – Cancelamento na etapa de dados do comprador', () => {
      prepararCheckout();
      cy.get('#cancel').click();
      cy.url().should('include', 'cart.html');
      cy.get('.cart_item').should('have.length', 1);
    });

    it('CT046 – Cancelamento na etapa de resumo', () => {
      prepararCheckout();
      cy.preencherDados(DADOS);
      cy.get('#cancel').click();
      cy.url().should('include', 'inventory.html');
      cy.get('.shopping_cart_badge').should('have.text', '1');
    });

    it('CT047 – Checkout com carrinho vazio', () => {
      cy.login('standard_user');
      cy.get('.shopping_cart_link').click();
      cy.get('.cart_item').should('not.exist');
      cy.get('#checkout').click();
      cy.url().should('include', 'cart.html'); // o checkout não deveria iniciar com o carrinho vazio
    });

    it('CT048 – Conclusão da compra com error_user', () => {
      prepararCheckout('error_user');
      cy.preencherDados(DADOS);
      cy.get('#finish').click();
      cy.get('.complete-header', { timeout: 5000 }).should('have.text', 'Thank you for your order!');
    });

    it('CT049 – Disponibilidade do checkout para visual_user', () => {
      cy.login('visual_user');
      cy.botaoAdicionar('sauce-labs-backpack').click();
      cy.get('.shopping_cart_link').click();
      cy.get('.cart_item').last().then(($item) => {
        const item = $item[0].getBoundingClientRect();
        cy.get('#checkout').then(($btn) => {
          const btn = $btn[0].getBoundingClientRect();
          expect(btn.top, 'botão Checkout deveria ficar abaixo da lista de itens').to.be.greaterThan(item.bottom);
        });
      });
      cy.get('#checkout').click();
      cy.get('.title').should('have.text', 'Checkout: Your Information');
    });
  });
});
