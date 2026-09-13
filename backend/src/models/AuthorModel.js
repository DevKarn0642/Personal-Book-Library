function createAuthorModel({ pool }) {
  async function create({ authorName, authorPenName }) {
    const { rows } = await pool.query(
      `INSERT INTO author (author_name, author_pen_name)
       VALUES ($1, $2)
       RETURNING author_id, author_name, author_pen_name`,
      [authorName, authorPenName],
    );
    return rows[0];
  }

  async function findPage({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT author_id, author_name, author_pen_name
       FROM author
       ORDER BY author_id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async function countAll() {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM author');
    return rows[0].total;
  }

  async function findById(authorId) {
    const { rows } = await pool.query(
      `SELECT author_id, author_name, author_pen_name
       FROM author
       WHERE author_id = $1
       LIMIT 1`,
      [authorId],
    );
    return rows[0];
  }

  async function update(authorId, { authorName, authorPenName }) {
    const { rows } = await pool.query(
      `UPDATE author
       SET author_name = $1, author_pen_name = $2
       WHERE author_id = $3
       RETURNING author_id, author_name, author_pen_name`,
      [authorName, authorPenName, authorId],
    );
    return rows[0];
  }

  async function remove(authorId) {
    const { rows } = await pool.query(
      `DELETE FROM author
       WHERE author_id = $1
       RETURNING author_id, author_name, author_pen_name`,
      [authorId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, remove, update };
}

module.exports = { createAuthorModel };
