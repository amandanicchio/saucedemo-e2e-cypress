# Testes E2E – Swag Labs (Sauce Demo) com Cypress

Entrega 4 da disciplina Teste de Software. Testes de sistema (ponta a ponta) automatizados com **Cypress**.

## Requisitos validados

| ID   | Requisito | Arquivo de teste | Casos |
|------|-----------|------------------|-------|
| RF01 | Login | `cypress/e2e/rf01-login.cy.js` | CT001 a CT011 |
| RF03 | Carrinho de Compras | `cypress/e2e/rf03-carrinho.cy.js` | CT022 a CT032 |
| RF04 | Checkout | `cypress/e2e/rf04-checkout.cy.js` | CT033 a CT049 |

Os IDs dos casos são os mesmos do Projeto de Casos de Teste (Entrega 2).

## Como executar

Localmente (Node.js 18+): `npm install` e depois `npx cypress run`.

No GitHub: a execução é feita pelo GitHub Actions (`.github/workflows/cypress.yml`) a cada envio de arquivos, ou pela aba **Actions → Run workflow**.
