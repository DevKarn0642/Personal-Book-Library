function createCategoryModel({ pool }) {
  async function create(categoryName) {
    const { rows } = await pool.query(
      `INSERT INTO category (category_name)
       VALUES ($1)
       RETURNING category_id, category_name`,
      [categoryName],
    );
    return rows[0];
  }

  async function findPage({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT category_id, category_name
       FROM category
       ORDER BY category_id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async function countAll() {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM category');
    return rows[0].total;
  }

  async function findById(categoryId) {
    const { rows } = await pool.query(
      `SELECT category_id, category_name
       FROM category
       WHERE category_id = $1
       LIMIT 1`,
      [categoryId],
    );
    return rows[0];
  }

  async function update(categoryId, categoryName) {
    const { rows } = await pool.query(
      `UPDATE category
       SET category_name = $1
       WHERE category_id = $2
       RETURNING category_id, category_name`,
      [categoryName, categoryId],
    );
    return rows[0];
  }

  async function remove(categoryId) {
    const { rows } = await pool.query(
      `DELETE FROM category
       WHERE category_id = $1
       RETURNING category_id, category_name`,
      [categoryId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, remove, update };
}

module.exports = { createCategoryModel };
