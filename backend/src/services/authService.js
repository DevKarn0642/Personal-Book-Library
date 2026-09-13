const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function createAuthService({ userModel, jwtSecret }) {
  if (typeof jwtSecret !== 'string' || Buffer.byteLength(jwtSecret) < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }
  // Compare a password even when the account is missing or ambiguous.
  const dummyHash = bcrypt.hashSync('unused-account-password', 12);

  async function login({ email, username, password }) {
    const users = email !== undefined
      ? await userModel.findByEmail(email)
      : await userModel.findByUsername(username);
    // Existing usernames are not unique: never choose an arbitrary account.
    const user = users.length === 1 ? users[0] : undefined;
    const matches = await bcrypt.compare(password, user?.user_pass || dummyHash);
    if (!user || !matches) {
      return null;
    }

    const accessToken = jwt.sign({}, jwtSecret, {
      algorithm: 'HS256', subject: String(user.user_id), expiresIn: 3600,
    });
    return {
      accessToken, tokenType: 'Bearer', expiresIn: 3600,
      user: { user_id: user.user_id, user_name: user.user_name, user_email: user.user_email },
    };
  }

  return { login };
}

module.exports = { createAuthService };
