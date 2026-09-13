const express = require('express');
const {
  validateShelf,
  validateShelfId,
  validateShelfPagination,
} = require('../middlewares/validateShelf');

function createShelfRouter({ shelfController, requireAuthentication }) {
  const router = express.Router();

  router.post('/', requireAuthentication, validateShelf, shelfController.create);
  router.get('/', requireAuthentication, validateShelfPagination, shelfController.list);
  router.get('/:shelfId', requireAuthentication, validateShelfId, shelfController.getById);
  router.put(
    '/:shelfId',
    requireAuthentication,
    validateShelfId,
    validateShelf,
    shelfController.update,
  );
  router.delete(
    '/:shelfId',
    requireAuthentication,
    validateShelfId,
    shelfController.remove,
  );

  return router;
}

module.exports = { createShelfRouter };
