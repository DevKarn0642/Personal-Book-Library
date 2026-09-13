const jwt = require('jsonwebtoken');

function readCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) return undefined;

  const cookie = cookieHeader
    .split(';')
    .map(value => value.trim())
    .find(value => value.startsWith(`${cookieName}=`));

  if (!cookie) return undefined;

  try {
    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  } catch {
    return undefined;
  }
}

function createRequireAuthentication({ jwtSecret }) {
  return function requireAuthentication(req, res, next) {
    const accessToken = readCookieValue(req.headers.cookie, 'access_token');

    if (!accessToken) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
      const claims = jwt.verify(accessToken, jwtSecret, { algorithms: ['HS256'] });
      if (typeof claims.sub !== 'string' || !claims.sub) {
        return res.status(401).json({ message: 'Authentication required.' });
      }
      req.auth = { userId: claims.sub };
      return next();
    } catch {
      return res.status(401).json({ message: 'Authentication required.' });
    }
  };
}

module.exports = { createRequireAuthentication };
