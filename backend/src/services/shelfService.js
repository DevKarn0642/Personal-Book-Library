function createShelfService({ shelfModel }) {
  async function createShelf(shelfInput) {
    return shelfModel.create(shelfInput);
  }

  async function listShelves({ limit, offset }) {
    const [shelves, total] = await Promise.all([
      shelfModel.findPage({ limit, offset }),
      shelfModel.countAll(),
    ]);

    return { shelves, total: Number(total) };
  }

  async function getShelfById(shelfId) {
    return shelfModel.findById(shelfId);
  }

  async function updateShelf(shelfId, shelfInput) {
    return shelfModel.update(shelfId, shelfInput);
  }

  async function deleteShelf(shelfId) {
    return shelfModel.remove(shelfId);
  }

  return {
    createShelf,
    listShelves,
    getShelfById,
    updateShelf,
    deleteShelf,
  };
}

module.exports = { createShelfService };
