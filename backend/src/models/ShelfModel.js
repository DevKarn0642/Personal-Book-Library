function createShelfModel({ pool }) {
  async function create({ shelfName, shelfLimit, shelfColor, shelfMaterial }) {
    const { rows } = await pool.query(
      `INSERT INTO shelf (shelf_name, shelf_limit, shelf_color, shelf_material)
       VALUES ($1, $2, $3, $4)
       RETURNING shelf_id, shelf_name, shelf_limit, shelf_color, shelf_material`,
      [shelfName, shelfLimit, shelfColor, shelfMaterial],
    );
    return rows[0];
  }

  async function findPage({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT shelf_id, shelf_name, shelf_limit, shelf_color, shelf_material
       FROM shelf
       ORDER BY shelf_id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async function countAll() {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM shelf');
    return rows[0].total;
  }

  async function findById(shelfId) {
    const { rows } = await pool.query(
      `SELECT shelf_id, shelf_name, shelf_limit, shelf_color, shelf_material
       FROM shelf
       WHERE shelf_id = $1
       LIMIT 1`,
      [shelfId],
    );
    return rows[0];
  }

  async function update(shelfId, { shelfName, shelfLimit, shelfColor, shelfMaterial }) {
    const { rows } = await pool.query(
      `UPDATE shelf
       SET shelf_name = $1,
           shelf_limit = $2,
           shelf_color = $3,
           shelf_material = $4
       WHERE shelf_id = $5
       RETURNING shelf_id, shelf_name, shelf_limit, shelf_color, shelf_material`,
      [shelfName, shelfLimit, shelfColor, shelfMaterial, shelfId],
    );
    return rows[0];
  }

  async function remove(shelfId) {
    const { rows } = await pool.query(
      `DELETE FROM shelf
       WHERE shelf_id = $1
       RETURNING shelf_id, shelf_name, shelf_limit, shelf_color, shelf_material`,
      [shelfId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, remove, update };
}

module.exports = { createShelfModel };
