// RF01 – Login
// O sistema deve permitir o acesso somente a usuários com combinação válida de usuário e senha,
// exibir mensagens de erro para credenciais inválidas, campos vazios e usuário bloqueado, e
// impedir o acesso às páginas internas sem autenticação.
import { SENHA } from '../support/commands';

const MSG_INVALIDO = 'Epic sadface: Username and password do not match any user in this service';
const erro = () => cy.get('[data-test="error"]');

describe('RF01 – Login', () => {

  context('Cenário 1.1 – Autenticação com credenciais válidas', () => {
    it('CT001 – Login com credenciais válidas', () => {
      cy.login('standard_user');
      cy.url().should('match', /\/inventory\.html$/);
      cy.get('.title').should('have.text', 'Products');
      cy.get('.inventory_item').should('have.length', 6);
    });

    it('CT002 – Tempo de resposta do login com performance_glitch_user (até 3 s)', () => {
      cy.visit('/');
      cy.get('#user-name').type('performance_glitch_user');
      cy.get('#password').type(SENHA, { log: false });
      let inicio;
      cy.then(() => { inicio = Date.now(); });
      cy.get('#login-button').click();
      cy.get('.inventory_list', { timeout: 15000 }).should('be.visible').then(() => {
        const segundos = (Date.now() - inicio) / 1000;
        cy.log(`Tempo de login: ${segundos.toFixed(2)} s`);
        expect(segundos, `login levou ${segundos.toFixed(2)} s`).to.be.at.most(3);
      });
    });
  });

  context('Cenário 1.2 – Autenticação com credenciais inválidas', () => {
    it('CT003 – Login com senha incorreta', () => {
      cy.login('standard_user', 'senha_errada');
      erro().should('have.text', MSG_INVALIDO);
      cy.url().should('not.include', 'inventory');
    });

    it('CT004 – Login com usuário inexistente', () => {
      cy.login('usuario_teste');
      erro().should('have.text', MSG_INVALIDO);
    });

    it('CT005 – Login com usuário bloqueado', () => {
      cy.login('locked_out_user');
      erro().should('have.text', 'Epic sadface: Sorry, this user has been locked out.');
    });

    it('CT006 – Login com caracteres especiais no username', () => {
      cy.login('@#$%!');
      erro().should('be.visible');
      cy.url().should('not.include', 'inventory');
    });
  });

  context('Cenário 1.3 – Validação de campos obrigatórios', () => {
    it('CT007 – Username e senha vazios', () => {
      cy.visit('/');
      cy.get('#login-button').click();
      erro().should('have.text', 'Epic sadface: Username is required');
    });

    it('CT008 – Username vazio e senha preenchida', () => {
      cy.visit('/');
      cy.get('#password').type(SENHA, { log: false });
      cy.get('#login-button').click();
      erro().should('have.text', 'Epic sadface: Username is required');
    });

    it('CT009 – Username preenchido e senha vazia', () => {
      cy.visit('/');
      cy.get('#user-name').type('standard_user');
      cy.get('#login-button').click();
      erro().should('have.text', 'Epic sadface: Password is required');
    });
  });

  context('Cenário 1.4 – Controle de acesso às páginas internas', () => {
    it('CT010 – Acesso direto ao inventário sem login', () => {
      cy.visit('/inventory.html', { failOnStatusCode: false });
      cy.get('#login-button').should('be.visible');
      erro().should('contain.text', "You can only access '/inventory.html' when you are logged in");
    });

    it('CT011 – Acesso ao inventário após logout (botão Voltar)', () => {
      cy.login('standard_user');
      cy.logout();
      cy.go('back');
      cy.get('#login-button').should('be.visible');
      cy.get('.inventory_list').should('not.exist');
    });
  });
});
