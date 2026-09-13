function createAuthController({ authService }) {
  const cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
  };

  async function login(req, res, next) {
    try {
      const result = await authService.login(req.loginCredentials);
      if (!result) {
        return res.status(401).json({ message: 'Invalid email, username or password.' });
      }
      const { accessToken, ...payload } = result;
      res.cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: result.expiresIn * 1000,
      });
      return res.json(payload);
    } catch (error) {
      next(error);
    }
  }

  async function me(req, res, next) {
    try {
      const user = await authService.findUserById(req.auth.userId);
      if (!user) {
        res.clearCookie('access_token', cookieOptions);
        return res.status(401).json({ message: 'Authentication required.' });
      }
      return res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  function logout(req, res) {
    res.clearCookie('access_token', cookieOptions);
    return res.status(204).end();
  }

  return { login, logout, me };
}

module.exports = { createAuthController };
