function createShelfFloorModel({ pool }) {
  const floorColumns = 'shelf_floor_id, shelf_id, shelf_floor_limit, shelf_floor, book_id, category_id';

  async function findShelfById(shelfId) {
    const { rows } = await pool.query(
      `SELECT shelf_id
       FROM shelf
       WHERE shelf_id = $1
       LIMIT 1`,
      [shelfId],
    );
    return rows[0];
  }

  async function create({ shelfId, shelfFloorLimit, shelfFloor, bookId, categoryId }) {
    const { rows } = await pool.query(
      `INSERT INTO shelf_floor (
         shelf_id,
         shelf_floor_limit,
         shelf_floor,
         book_id,
         category_id
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${floorColumns}`,
      [shelfId, shelfFloorLimit, shelfFloor, bookId, categoryId],
    );
    return rows[0];
  }

  async function findPage(shelfId, { limit, offset }) {
    const { rows } = await pool.query(
      `SELECT ${floorColumns}
       FROM shelf_floor
       WHERE shelf_id = $1
       ORDER BY shelf_floor ASC, shelf_floor_id ASC
       LIMIT $2 OFFSET $3`,
      [shelfId, limit, offset],
    );
    return rows;
  }

  async function countAll(shelfId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM shelf_floor
       WHERE shelf_id = $1`,
      [shelfId],
    );
    return rows[0].total;
  }

  async function findById(shelfId, shelfFloorId) {
    const { rows } = await pool.query(
      `SELECT ${floorColumns}
       FROM shelf_floor
       WHERE shelf_id = $1 AND shelf_floor_id = $2
       LIMIT 1`,
      [shelfId, shelfFloorId],
    );
    return rows[0];
  }

  async function update(shelfId, shelfFloorId, {
    shelfFloorLimit,
    shelfFloor,
    bookId,
    categoryId,
  }) {
    const { rows } = await pool.query(
      `UPDATE shelf_floor
       SET shelf_floor_limit = $1,
           shelf_floor = $2,
           book_id = $3,
           category_id = $4
       WHERE shelf_id = $5 AND shelf_floor_id = $6
       RETURNING ${floorColumns}`,
      [shelfFloorLimit, shelfFloor, bookId, categoryId, shelfId, shelfFloorId],
    );
    return rows[0];
  }

  async function remove(shelfId, shelfFloorId) {
    const { rows } = await pool.query(
      `DELETE FROM shelf_floor
       WHERE shelf_id = $1 AND shelf_floor_id = $2
       RETURNING ${floorColumns}`,
      [shelfId, shelfFloorId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, findShelfById, remove, update };
}

module.exports = { createShelfFloorModel };
