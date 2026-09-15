const express = require('express');
const {
  validateHistory,
  validateHistoryId,
  validateHistoryPagination,
} = require('../middlewares/validateHistory');

function createHistoryRouter({ historyController, requireAuthentication }) {
  const router = express.Router();

  router.post('/', requireAuthentication, validateHistory, historyController.create);
  router.get('/', requireAuthentication, validateHistoryPagination, historyController.list);
  router.get('/:historyId', requireAuthentication, validateHistoryId, historyController.getById);
  router.put(
    '/:historyId',
    requireAuthentication,
    validateHistoryId,
    validateHistory,
    historyController.update,
  );
  router.delete(
    '/:historyId',
    requireAuthentication,
    validateHistoryId,
    historyController.remove,
  );

  return router;
}

module.exports = { createHistoryRouter };
