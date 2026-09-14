const express = require('express');
const {
  validateAlert,
  validateAlertId,
  validateAlertPagination,
} = require('../middlewares/validateAlert');

function createAlertRouter({ alertController, requireAuthentication }) {
  const router = express.Router();

  router.post('/', requireAuthentication, validateAlert, alertController.create);
  router.get('/', requireAuthentication, validateAlertPagination, alertController.list);
  router.get('/books', requireAuthentication, alertController.listBookOptions);
  router.get('/:alertId', requireAuthentication, validateAlertId, alertController.getById);
  router.put(
    '/:alertId',
    requireAuthentication,
    validateAlertId,
    validateAlert,
    alertController.update,
  );
  router.delete(
    '/:alertId',
    requireAuthentication,
    validateAlertId,
    alertController.remove,
  );

  return router;
}

module.exports = { createAlertRouter };
