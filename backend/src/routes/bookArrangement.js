const express = require('express');
const {
  validateBookArrangementAssignment,
  validateBookArrangementPagination,
} = require('../middlewares/validateBookArrangement');

function createBookArrangementRouter({ bookArrangementController, requireAuthentication }) {
  const router = express.Router();

  router.get('/books', requireAuthentication, validateBookArrangementPagination, bookArrangementController.listBooks);
  router.get('/reference-data', requireAuthentication, bookArrangementController.listReferenceData);
  router.get('/shelves', requireAuthentication, bookArrangementController.listShelves);
  router.post('/assignments', requireAuthentication, validateBookArrangementAssignment, bookArrangementController.assignBook);

  return router;
}

module.exports = { createBookArrangementRouter };
