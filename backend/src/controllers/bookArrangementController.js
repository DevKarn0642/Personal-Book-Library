function createBookArrangementController({ bookArrangementService }) {
  async function listBooks(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { books, total } = await bookArrangementService.listBooks({
        filters: req.bookArrangementFilters,
        limit: pageSize,
        offset,
      });
      return res.json({
        books,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function listReferenceData(req, res, next) {
    try {
      const referenceData = await bookArrangementService.listReferenceData();
      return res.json(referenceData);
    } catch (error) {
      return next(error);
    }
  }

  async function listShelves(req, res, next) {
    try {
      const shelves = await bookArrangementService.listShelves();
      return res.json({ shelves });
    } catch (error) {
      return next(error);
    }
  }

  async function assignBook(req, res, next) {
    try {
      const result = await bookArrangementService.assignBook(req.bookArrangementAssignment);
      const responseByReason = {
        bookNotFound: [404, 'Book not found.'],
        bookTypeNotSupported: [400, 'Only physical books can be placed on a shelf.'],
        bookAlreadyAssigned: [409, 'This book is already assigned to a shelf floor.'],
        shelfFloorNotFound: [404, 'Shelf floor not found.'],
        shelfFloorFull: [409, 'This shelf floor has reached its capacity.'],
      };

      if (result.reason) {
        const [status, message] = responseByReason[result.reason];
        return res.status(status).json({ message });
      }

      return res.status(201).json({ assignment: result.assignment });
    } catch (error) {
      return next(error);
    }
  }

  return { assignBook, listBooks, listReferenceData, listShelves };
}

module.exports = { createBookArrangementController };
