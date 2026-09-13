const express = require('express');
const {
  validateAuthor,
  validateAuthorId,
  validateAuthorPagination,
} = require('../middlewares/validateAuthor');

function createAuthorRouter({ authorController, requireAuthentication }) {
  const router = express.Router();

  router.post('/', requireAuthentication, validateAuthor, authorController.create);
  router.get('/', requireAuthentication, validateAuthorPagination, authorController.list);
  router.get('/:authorId', requireAuthentication, validateAuthorId, authorController.getById);
  router.put(
    '/:authorId',
    requireAuthentication,
    validateAuthorId,
    validateAuthor,
    authorController.update,
  );
  router.delete(
    '/:authorId',
    requireAuthentication,
    validateAuthorId,
    authorController.remove,
  );

  return router;
}

module.exports = { createAuthorRouter };
