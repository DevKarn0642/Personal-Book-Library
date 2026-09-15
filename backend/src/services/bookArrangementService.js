function createBookArrangementService({ bookArrangementModel }) {
  async function listBooks({ filters, limit, offset }) {
    const [books, total] = await Promise.all([
      bookArrangementModel.findBookPage({ filters, limit, offset }),
      bookArrangementModel.countBooks(filters),
    ]);

    return { books, total: Number(total) };
  }

  async function listReferenceData() {
    const [categories, authors] = await Promise.all([
      bookArrangementModel.findCategories(),
      bookArrangementModel.findAuthors(),
    ]);

    return { categories, authors };
  }

  async function listShelves() {
    const rows = await bookArrangementModel.findShelvesWithFloors();
    const shelvesById = new Map();

    for (const row of rows) {
      const shelfId = String(row.shelf_id);
      if (!shelvesById.has(shelfId)) {
        shelvesById.set(shelfId, {
          shelf_id: row.shelf_id,
          shelf_name: row.shelf_name,
          floors: [],
        });
      }

      shelvesById.get(shelfId).floors.push({
        shelf_floor_id: row.shelf_floor_id,
        shelf_floor: row.shelf_floor,
        shelf_floor_limit: row.shelf_floor_limit,
        category_id: row.category_id,
        category_name: row.category_name,
        assigned_count: Number(row.assigned_count),
      });
    }

    return [...shelvesById.values()];
  }

  async function assignBook({ bookId, shelfFloorId }) {
    const book = await bookArrangementModel.findBookForAssignment(bookId);
    if (!book) return { reason: 'bookNotFound' };

    if (book.book_type !== 'physical') return { reason: 'bookTypeNotSupported' };

    const existingAssignment = await bookArrangementModel.findAssignmentByBookId(bookId);
    if (existingAssignment) return { reason: 'bookAlreadyAssigned' };

    const shelfFloor = await bookArrangementModel.findFloorForAssignment(shelfFloorId);
    if (!shelfFloor) return { reason: 'shelfFloorNotFound' };

    const floorLimit = shelfFloor.shelf_floor_limit;
    if (floorLimit !== null && Number(shelfFloor.assigned_count) >= Number(floorLimit)) {
      return { reason: 'shelfFloorFull' };
    }

    const assignment = await bookArrangementModel.createAssignment({ bookId, shelfFloorId });
    return { assignment };
  }

  return { assignBook, listBooks, listReferenceData, listShelves };
}

module.exports = { createBookArrangementService };
