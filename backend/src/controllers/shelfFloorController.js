function createShelfFloorController({ shelfFloorService }) {
  async function create(req, res, next) {
    try {
      const result = await shelfFloorService.createShelfFloor(req.shelfFloorInput);
      if (!result.shelfExists) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      return res.status(201).json({ shelfFloor: result.shelfFloor });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const result = await shelfFloorService.listShelfFloors({
        shelfId: req.shelfId,
        limit: pageSize,
        offset,
      });
      if (!result.shelfExists) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      return res.json({
        shelfFloors: result.shelfFloors,
        pagination: {
          page,
          pageSize,
          total: result.total,
          totalPages: Math.ceil(result.total / pageSize),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      const result = await shelfFloorService.getShelfFloor(req.shelfId, req.shelfFloorId);
      if (!result.shelfExists) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      if (!result.shelfFloor) {
        return res.status(404).json({ message: 'Shelf floor not found.' });
      }
      return res.json({ shelfFloor: result.shelfFloor });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const result = await shelfFloorService.updateShelfFloor(
        req.shelfId,
        req.shelfFloorId,
        req.shelfFloorInput,
      );
      if (!result.shelfExists) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      if (!result.shelfFloor) {
        return res.status(404).json({ message: 'Shelf floor not found.' });
      }
      return res.json({ shelfFloor: result.shelfFloor });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const result = await shelfFloorService.deleteShelfFloor(req.shelfId, req.shelfFloorId);
      if (!result.shelfExists) {
        return res.status(404).json({ message: 'Shelf not found.' });
      }
      if (!result.shelfFloor) {
        return res.status(404).json({ message: 'Shelf floor not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, getById, list, remove, update };
}

module.exports = { createShelfFloorController };
