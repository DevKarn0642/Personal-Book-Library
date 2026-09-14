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
const { createShelfRouter } = require('./src/routes/shelf');
const { createShelfController } = require('./src/controllers/shelfController');
const { createShelfService } = require('./src/services/shelfService');
const { createShelfModel } = require('./src/models/ShelfModel');
const { createShelfFloorRouter } = require('./src/routes/shelfFloor');
const { createShelfFloorController } = require('./src/controllers/shelfFloorController');
const { createShelfFloorService } = require('./src/services/shelfFloorService');
const { createShelfFloorModel } = require('./src/models/ShelfFloorModel');
const { createAlertRouter } = require('./src/routes/alert');
const { createAlertController } = require('./src/controllers/alertController');
const { createAlertService } = require('./src/services/alertService');
const { createAlertModel } = require('./src/models/AlertModel');
const { createBookRouter } = require('./src/routes/book');
const { createBookController } = require('./src/controllers/bookController');
const { createBookService } = require('./src/services/bookService');
const { createBookModel } = require('./src/models/BookModel');
const { createBookFileUpload } = require('./src/middlewares/uploadBookFile');
const { errorHandler } = require('./src/middlewares/errorHandler');
const { createRequireAuthentication } = require('./src/middlewares/requireAuthentication');

function createApp({ pool, jwtSecret, bookCoverUploadDirectory, bookUploadDirectory }) {
  const userModel = createUserModel({ pool });
  const authService = createAuthService({ userModel, jwtSecret });
  const authController = createAuthController({ authService });
  const categoryModel = createCategoryModel({ pool });
  const categoryService = createCategoryService({ categoryModel });
  const categoryController = createCategoryController({ categoryService });
  const authorModel = createAuthorModel({ pool });
  const authorService = createAuthorService({ authorModel });
  const authorController = createAuthorController({ authorService });
  const shelfModel = createShelfModel({ pool });
  const shelfService = createShelfService({ shelfModel });
  const shelfController = createShelfController({ shelfService });
  const shelfFloorModel = createShelfFloorModel({ pool });
  const shelfFloorService = createShelfFloorService({ shelfFloorModel });
  const shelfFloorController = createShelfFloorController({ shelfFloorService });
  const alertModel = createAlertModel({ pool });
  const alertService = createAlertService({ alertModel });
  const alertController = createAlertController({ alertService });
  const bookModel = createBookModel({ pool });
  const bookService = createBookService({ bookModel });
  const bookController = createBookController({ bookService });
  const bookFileUpload = createBookFileUpload({ bookCoverUploadDirectory, bookUploadDirectory });
  const requireAuthentication = createRequireAuthentication({ jwtSecret });

  const app = express();
  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_ORIGIN || ['http://localhost:5173', 'http://localhost:8080'],
  }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/uploads/books', requireAuthentication, express.static(bookFileUpload.bookUploadDirectory));
  app.use('/uploads/covers', requireAuthentication, express.static(bookFileUpload.bookCoverUploadDirectory));
  app.use('/api/auth', createAuthRouter({ authController, requireAuthentication }));
  app.use('/api/categories', createCategoryRouter({ categoryController, requireAuthentication }));
  app.use('/api/authors', createAuthorRouter({ authorController, requireAuthentication }));
  app.use('/api/books', createBookRouter({ bookController, bookFileUpload, requireAuthentication }));
  app.use('/api/shelves', createShelfRouter({ shelfController, requireAuthentication }));
  app.use('/api/shelves/:shelfId/floors', createShelfFloorRouter({ shelfFloorController, requireAuthentication }));
  app.use('/api/alerts', createAlertRouter({ alertController, requireAuthentication }));
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
