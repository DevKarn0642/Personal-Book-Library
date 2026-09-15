function createHistoryService({ bookModel, historyModel }) {
  async function createHistory(historyInput, userId) {
    const book = await bookModel.findById(historyInput.bookId);
    if (!book) return { history: undefined, missingResource: 'book' };

    const history = await historyModel.create({ ...historyInput, userId });
    return { history };
  }

  async function listHistories(userId, { bookId, limit, offset }) {
    const [histories, total] = await Promise.all([
      historyModel.findPage(userId, { bookId, limit, offset }),
      historyModel.countAll(userId, { bookId }),
    ]);
    return { histories, total: Number(total) };
  }

  async function getHistoryById(historyId, userId) {
    return historyModel.findById(historyId, userId);
  }

  async function updateHistory(historyId, userId, historyInput) {
    const existingHistory = await historyModel.findById(historyId, userId);
    if (!existingHistory) return { history: undefined, missingResource: 'history' };

    const book = await bookModel.findById(historyInput.bookId);
    if (!book) return { history: undefined, missingResource: 'book' };

    const history = await historyModel.update(historyId, userId, historyInput);
    if (!history) return { history: undefined, missingResource: 'history' };
    return { history };
  }

  async function deleteHistory(historyId, userId) {
    return historyModel.remove(historyId, userId);
  }

  return {
    createHistory,
    deleteHistory,
    getHistoryById,
    listHistories,
    updateHistory,
  };
}

module.exports = { createHistoryService };
