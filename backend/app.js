const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createAuthRouter } = require('./src/routes/auth');
const { createAuthController } = require('./src/controllers/authController');
const { createAuthService } = require('./src/services/authService');
const { createUserModel } = require('./src/models/userModel');
const { createCategoryRouter } = require('./src/routes/category');
const { createCategoryController } = require('./src/controllers/categoryController');
const { createCategoryService } = require('./src/services/categoryService');
const { createCategoryModel } = require('./src/models/CategoryModel');
const { createAuthorRouter } = require('./src/routes/author');
const { createAuthorController } = require('./src/controllers/authorController');
const { createAuthorService } = require('./src/services/authorService');
const { createAuthorModel } = require('./src/models/AuthorModel');
const { errorHandler } = require('./src/middlewares/errorHandler');
const { createRequireAuthentication } = require('./src/middlewares/requireAuthentication');

function createApp({ pool, jwtSecret }) {
  const userModel = createUserModel({ pool });
  const authService = createAuthService({ userModel, jwtSecret });
  const authController = createAuthController({ authService });
  const categoryModel = createCategoryModel({ pool });
  const categoryService = createCategoryService({ categoryModel });
  const categoryController = createCategoryController({ categoryService });
  const authorModel = createAuthorModel({ pool });
  const authorService = createAuthorService({ authorModel });
  const authorController = createAuthorController({ authorService });
  const requireAuthentication = createRequireAuthentication({ jwtSecret });

  const app = express();
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_ORIGIN || ['http://localhost:5173', 'http://localhost:8080'],
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/auth', createAuthRouter({ authController, requireAuthentication }));
  app.use('/api/categories', createCategoryRouter({ categoryController, requireAuthentication }));
  app.use('/api/authors', createAuthorRouter({ authorController, requireAuthentication }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
