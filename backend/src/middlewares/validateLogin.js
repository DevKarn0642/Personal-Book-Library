function validateLogin(req, res, next) {
  res.set('Cache-Control', 'no-store');
  const { email, username, password } = req.body || {};
  const useEmail = email !== undefined;
  const identifier = useEmail ? email : username;
  if ((useEmail && username !== undefined) ||
      typeof identifier !== 'string' || identifier.trim().length === 0 ||
      identifier.trim().length > (useEmail ? 255 : 100) ||
      (useEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) ||
      typeof password !== 'string' || password.length === 0 ||
      Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Provide either a valid email or username, and a password (1-72 bytes).' });
  }

  req.loginCredentials = { [useEmail ? 'email' : 'username']: identifier.trim(), password };
  next();
}

module.exports = { validateLogin };
