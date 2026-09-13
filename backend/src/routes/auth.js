const express = require('express');
const { createLoginRateLimiter } = require('../middlewares/loginRateLimiter');
const { validateLogin } = require('../middlewares/validateLogin');

function createAuthRouter({ authController }) {
  const router = express.Router();
  router.post('/login', createLoginRateLimiter(), validateLogin, authController.login);
  return router;
}

module.exports = { createAuthRouter };
