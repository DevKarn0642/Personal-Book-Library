const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createAuthRouter } = require('./src/routes/auth');
const { createAuthController } = require('./src/controllers/authController');
const { createAuthService } = require('./src/services/authService');
const { createUserModel } = require('./src/models/userModel');
const { errorHandler } = require('./src/middlewares/errorHandler');

function createApp({ pool, jwtSecret }) {
  const userModel = createUserModel({ pool });
  const authService = createAuthService({ userModel, jwtSecret });
  const authController = createAuthController({ authService });

  const app = express();
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_ORIGIN || ['http://localhost:5173', 'http://localhost:8080'],
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/auth', createAuthRouter({ authController }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
