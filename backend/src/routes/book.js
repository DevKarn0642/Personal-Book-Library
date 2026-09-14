const express = require('express');
const {
  validateBook,
  validateBookId,
  validateBookPagination,
} = require('../middlewares/validateBook');

function createBookRouter({ bookController, bookFileUpload, requireAuthentication }) {
  const router = express.Router();

  router.use(bookFileUpload.setUploadDirectories);

  router.post('/', requireAuthentication, bookFileUpload.handleUpload, validateBook, bookController.create);
  router.get('/', requireAuthentication, validateBookPagination, bookController.list);
  router.get('/:bookId', requireAuthentication, validateBookId, bookController.getById);
  router.put(
    '/:bookId',
    requireAuthentication,
    validateBookId,
    bookFileUpload.handleUpload,
    validateBook,
    bookController.update,
  );
  router.delete('/:bookId', requireAuthentication, validateBookId, bookController.remove);

  return router;
}

module.exports = { createBookRouter };
