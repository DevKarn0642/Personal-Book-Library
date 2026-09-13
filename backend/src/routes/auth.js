const express = require('express');
const { createLoginRateLimiter } = require('../middlewares/loginRateLimiter');
const { validateLogin } = require('../middlewares/validateLogin');

function createAuthRouter({ authController, requireAuthentication }) {
  const router = express.Router();
  router.post('/login', createLoginRateLimiter(), validateLogin, authController.login);
  router.get('/me', requireAuthentication, authController.me);
  router.post('/logout', authController.logout);
  return router;
}

module.exports = { createAuthRouter };
