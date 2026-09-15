function createHistoryController({ historyService }) {
  async function create(req, res, next) {
    try {
      const { history, missingResource } = await historyService.createHistory(req.historyInput, req.auth.userId);
      if (missingResource === 'book') {
        return res.status(404).json({ message: 'Book not found.' });
      }
      return res.status(201).json({ history });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { histories, total } = await historyService.listHistories(req.auth.userId, {
        bookId: req.historyFilter.bookId,
        limit: pageSize,
        offset,
      });
      return res.json({
        histories,
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
      const history = await historyService.getHistoryById(req.historyId, req.auth.userId);
      if (!history) {
        return res.status(404).json({ message: 'Reading history not found.' });
      }
      return res.json({ history });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const { history, missingResource } = await historyService.updateHistory(
        req.historyId,
        req.auth.userId,
        req.historyInput,
      );
      if (missingResource === 'history') {
        return res.status(404).json({ message: 'Reading history not found.' });
      }
      if (missingResource === 'book') {
        return res.status(404).json({ message: 'Book not found.' });
      }
      return res.json({ history });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const history = await historyService.deleteHistory(req.historyId, req.auth.userId);
      if (!history) {
        return res.status(404).json({ message: 'Reading history not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, getById, list, remove, update };
}

module.exports = { createHistoryController };
