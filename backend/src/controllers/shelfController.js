function createShelfController({ shelfService }) {
  async function create(req, res, next) {
    try {
      const shelf = await shelfService.createShelf(req.shelfInput);
      return res.status(201).json({ shelf });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { shelves, total } = await shelfService.listShelves({
        limit: pageSize,
        offset,
      });
      return res.json({
        shelves,
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

  async function getById(req, res, next) {
    try {
      const shelf = await shelfService.getShelfById(req.shelfId);
      if (!shelf) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      return res.json({ shelf });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const shelf = await shelfService.updateShelf(req.shelfId, req.shelfInput);
      if (!shelf) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      return res.json({ shelf });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const shelf = await shelfService.deleteShelf(req.shelfId);
      if (!shelf) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, list, getById, update, remove };
}

module.exports = { createShelfController };
