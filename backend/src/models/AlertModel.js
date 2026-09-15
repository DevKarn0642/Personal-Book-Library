function createAlertModel({ pool }) {
  const alertColumns = 'alert_id, alert_repeat_type, alert_date, alert_status, alert_time, user_id, book_id';
  const activeAlertColumns = `alert.alert_id,
    alert.alert_repeat_type,
    alert.alert_date,
    alert.alert_status,
    alert.alert_time,
    alert.user_id,
    alert.book_id,
    book.book_name`;

  async function create({ alertRepeatType, alertDate, alertStatus, alertTime, userId, bookId }) {
    const { rows } = await pool.query(
      `INSERT INTO alert (
         alert_repeat_type,
         alert_date,
         alert_status,
         alert_time,
         user_id,
         book_id
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${alertColumns}`,
      [alertRepeatType, alertDate, alertStatus, alertTime, userId, bookId],
    );
    return rows[0];
  }

  async function findPage(userId, { limit, offset }) {
    const { rows } = await pool.query(
      `SELECT ${alertColumns}
       FROM alert
       WHERE user_id = $1
       ORDER BY alert_date ASC NULLS LAST, alert_time ASC NULLS LAST, alert_id ASC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows;
  }

  async function countAll(userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM alert
       WHERE user_id = $1`,
      [userId],
    );
    return rows[0].total;
  }

  async function findBookOptions() {
    const { rows } = await pool.query(
      `SELECT book_id, book_name
       FROM book
       ORDER BY book_name ASC, book_id ASC`,
    );
    return rows;
  }

  async function findActiveForUser(userId) {
    const { rows } = await pool.query(
      `SELECT ${activeAlertColumns}
       FROM alert
       LEFT JOIN book ON book.book_id = alert.book_id
       WHERE alert.user_id = $1
         AND alert.alert_status = TRUE
         AND alert.alert_date IS NOT NULL
         AND alert.alert_time IS NOT NULL
       ORDER BY alert.alert_time ASC, alert.alert_id ASC`,
      [userId],
    );
    return rows;
  }

  async function findById(alertId, userId) {
    const { rows } = await pool.query(
      `SELECT ${alertColumns}
       FROM alert
       WHERE alert_id = $1 AND user_id = $2
       LIMIT 1`,
      [alertId, userId],
    );
    return rows[0];
  }

  async function update(alertId, userId, {
    alertRepeatType,
    alertDate,
    alertStatus,
    alertTime,
    bookId,
  }) {
    const { rows } = await pool.query(
      `UPDATE alert
       SET alert_repeat_type = $1,
           alert_date = $2,
           alert_status = $3,
           alert_time = $4,
           book_id = $5
       WHERE alert_id = $6 AND user_id = $7
       RETURNING ${alertColumns}`,
      [alertRepeatType, alertDate, alertStatus, alertTime, bookId, alertId, userId],
    );
    return rows[0];
  }

  async function remove(alertId, userId) {
    const { rows } = await pool.query(
      `DELETE FROM alert
       WHERE alert_id = $1 AND user_id = $2
       RETURNING ${alertColumns}`,
      [alertId, userId],
    );
    return rows[0];
  }

  return {
    countAll,
    create,
    findActiveForUser,
    findBookOptions,
    findById,
    findPage,
    remove,
    update,
  };
}

module.exports = { createAlertModel };
