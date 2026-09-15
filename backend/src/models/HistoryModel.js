function createHistoryModel({ pool }) {
  const historyColumns = 'history_id, user_id, book_id, history_page, history_status, history_date_at';

  async function create({ userId, bookId, historyPage, historyStatus }) {
    const { rows } = await pool.query(
      `INSERT INTO history (
         user_id,
         book_id,
         history_page,
         history_status
       )
       VALUES ($1, $2, $3, $4)
       RETURNING ${historyColumns}`,
      [userId, bookId, historyPage, historyStatus],
    );
    return rows[0];
  }

  async function findPage(userId, { limit, offset }) {
    const { rows } = await pool.query(
      `SELECT ${historyColumns}
       FROM history
       WHERE user_id = $1
       ORDER BY history_date_at DESC, history_id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows;
  }

  async function countAll(userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM history
       WHERE user_id = $1`,
      [userId],
    );
    return rows[0].total;
  }

  async function findById(historyId, userId) {
    const { rows } = await pool.query(
      `SELECT ${historyColumns}
       FROM history
       WHERE history_id = $1 AND user_id = $2
       LIMIT 1`,
      [historyId, userId],
    );
    return rows[0];
  }

  async function update(historyId, userId, { bookId, historyPage, historyStatus }) {
    const { rows } = await pool.query(
      `UPDATE history
       SET book_id = $1,
           history_page = $2,
           history_status = $3
       WHERE history_id = $4 AND user_id = $5
       RETURNING ${historyColumns}`,
      [bookId, historyPage, historyStatus, historyId, userId],
    );
    return rows[0];
  }

  async function remove(historyId, userId) {
    const { rows } = await pool.query(
      `DELETE FROM history
       WHERE history_id = $1 AND user_id = $2
       RETURNING ${historyColumns}`,
      [historyId, userId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, remove, update };
}

module.exports = { createHistoryModel };
