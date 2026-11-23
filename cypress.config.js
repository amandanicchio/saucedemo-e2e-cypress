const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    video: false,
    screenshotOnRunFailure: true,
  },
});
