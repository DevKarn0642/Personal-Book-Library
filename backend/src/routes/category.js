const express = require('express');
const {
  validateCategory,
  validateCategoryId,
  validateCategoryPagination,
} = require('../middlewares/validateCategory');

function createCategoryRouter({ categoryController, requireAuthentication }) {
  const router = express.Router();

  router.post('/', requireAuthentication, validateCategory, categoryController.create);
  router.get('/', requireAuthentication, validateCategoryPagination, categoryController.list);
  router.get('/:categoryId', requireAuthentication, validateCategoryId, categoryController.getById);
  router.put(
    '/:categoryId',
    requireAuthentication,
    validateCategoryId,
    validateCategory,
    categoryController.update,
  );
  router.delete(
    '/:categoryId',
    requireAuthentication,
    validateCategoryId,
    categoryController.remove,
  );

  return router;
}

module.exports = { createCategoryRouter };
