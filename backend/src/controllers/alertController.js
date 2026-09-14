function createAlertController({ alertService }) {
  async function create(req, res, next) {
    try {
      const alert = await alertService.createAlert(req.alertInput, req.auth.userId);
      return res.status(201).json({ alert });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { alerts, total } = await alertService.listAlerts(req.auth.userId, {
        limit: pageSize,
        offset,
      });
      return res.json({
        alerts,
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

  async function listBookOptions(req, res, next) {
    try {
      const books = await alertService.listAlertBookOptions();
      return res.json({ books });
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      const alert = await alertService.getAlertById(req.alertId, req.auth.userId);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
      }
      return res.json({ alert });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const alert = await alertService.updateAlert(req.alertId, req.auth.userId, req.alertInput);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
      }
      return res.json({ alert });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const alert = await alertService.deleteAlert(req.alertId, req.auth.userId);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, getById, list, listBookOptions, remove, update };
}

module.exports = { createAlertController };
