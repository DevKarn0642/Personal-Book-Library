function createShelfFloorService({ shelfFloorModel }) {
  async function createShelfFloor(shelfFloorInput) {
    const shelf = await shelfFloorModel.findShelfById(shelfFloorInput.shelfId);
    if (!shelf) {
      return { shelfExists: false };
    }

    const shelfFloor = await shelfFloorModel.create(shelfFloorInput);
    return { shelfExists: true, shelfFloor };
  }

  async function listShelfFloors({ shelfId, limit, offset }) {
    const shelf = await shelfFloorModel.findShelfById(shelfId);
    if (!shelf) {
      return { shelfExists: false };
    }

    const [shelfFloors, total] = await Promise.all([
      shelfFloorModel.findPage(shelfId, { limit, offset }),
      shelfFloorModel.countAll(shelfId),
    ]);
    return { shelfExists: true, shelfFloors, total: Number(total) };
  }

  async function getShelfFloor(shelfId, shelfFloorId) {
    const shelf = await shelfFloorModel.findShelfById(shelfId);
    if (!shelf) {
      return { shelfExists: false };
    }

    const shelfFloor = await shelfFloorModel.findById(shelfId, shelfFloorId);
    return { shelfExists: true, shelfFloor };
  }

  async function updateShelfFloor(shelfId, shelfFloorId, shelfFloorInput) {
    const shelf = await shelfFloorModel.findShelfById(shelfId);
    if (!shelf) {
      return { shelfExists: false };
    }

    const shelfFloor = await shelfFloorModel.update(shelfId, shelfFloorId, shelfFloorInput);
    return { shelfExists: true, shelfFloor };
  }

  async function deleteShelfFloor(shelfId, shelfFloorId) {
    const shelf = await shelfFloorModel.findShelfById(shelfId);
    if (!shelf) {
      return { shelfExists: false };
    }

    const shelfFloor = await shelfFloorModel.remove(shelfId, shelfFloorId);
    return { shelfExists: true, shelfFloor };
  }

  return {
    createShelfFloor,
    deleteShelfFloor,
    getShelfFloor,
    listShelfFloors,
    updateShelfFloor,
  };
}

module.exports = { createShelfFloorService };
