const express = require('express');
const {
  validateShelfFloor,
  validateShelfFloorId,
} = require('../middlewares/validateShelfFloor');
const {
  validateShelfId,
  validateShelfPagination,
} = require('../middlewares/validateShelf');

function createShelfFloorRouter({ shelfFloorController, requireAuthentication }) {
  const router = express.Router({ mergeParams: true });

  router.post(
    '/',
    requireAuthentication,
    validateShelfId,
    validateShelfFloor,
    shelfFloorController.create,
  );
  router.get(
    '/',
    requireAuthentication,
    validateShelfId,
    validateShelfPagination,
    shelfFloorController.list,
  );
  router.get(
    '/:shelfFloorId',
    requireAuthentication,
    validateShelfId,
    validateShelfFloorId,
    shelfFloorController.getById,
  );
  router.put(
    '/:shelfFloorId',
    requireAuthentication,
    validateShelfId,
    validateShelfFloorId,
    validateShelfFloor,
    shelfFloorController.update,
  );
  router.delete(
    '/:shelfFloorId',
    requireAuthentication,
    validateShelfId,
    validateShelfFloorId,
    shelfFloorController.remove,
  );

  return router;
}

module.exports = { createShelfFloorRouter };
