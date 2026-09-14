function createAlertService({ alertModel }) {
  async function createAlert(alertInput, userId) {
    return alertModel.create({ ...alertInput, userId });
  }

  async function listAlerts(userId, { limit, offset }) {
    const [alerts, total] = await Promise.all([
      alertModel.findPage(userId, { limit, offset }),
      alertModel.countAll(userId),
    ]);
    return { alerts, total: Number(total) };
  }

  async function listAlertBookOptions() {
    return alertModel.findBookOptions();
  }

  async function getAlertById(alertId, userId) {
    return alertModel.findById(alertId, userId);
  }

  async function updateAlert(alertId, userId, alertInput) {
    return alertModel.update(alertId, userId, alertInput);
  }

  async function deleteAlert(alertId, userId) {
    return alertModel.remove(alertId, userId);
  }

  return {
    createAlert,
    deleteAlert,
    getAlertById,
    listAlertBookOptions,
    listAlerts,
    updateAlert,
  };
}

module.exports = { createAlertService };
