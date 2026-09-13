function createAuthController({ authService }) {
  async function login(req, res, next) {
    try {
      const result = await authService.login(req.loginCredentials);
      if (!result) {
        return res.status(401).json({ message: 'Invalid email, username or password.' });
      }
      const { accessToken, ...payload } = result;
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        maxAge: result.expiresIn * 1000,
        path: '/',
        sameSite: 'lax',
        secure: process.env.COOKIE_SECURE === 'true',
      });
      return res.json(payload);
    } catch (error) {
      next(error);
    }
  }

  return { login };
}

module.exports = { createAuthController };
