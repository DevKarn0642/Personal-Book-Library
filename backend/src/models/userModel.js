function createUserModel({ pool }) {
  async function findById(userId) {
    const { rows } = await pool.query(
      'SELECT user_id, user_name, user_email FROM users WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    return rows[0];
  }

  async function findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT user_id, user_name, user_email, user_pass FROM users WHERE user_email = $1 LIMIT 2',
      [email],
    );
    return rows;
  }

  async function findByUsername(username) {
    const { rows } = await pool.query(
      'SELECT user_id, user_name, user_email, user_pass FROM users WHERE user_name = $1 LIMIT 2',
      [username],
    );
    return rows;
  }

  return { findByEmail, findById, findByUsername };
}

module.exports = { createUserModel };
