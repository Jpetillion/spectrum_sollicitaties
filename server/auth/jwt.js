import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Niet geautoriseerd. Log eerst in.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Niet geautoriseerd. Log eerst in.' });
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role
  };

  next();
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Niet geautoriseerd. Log eerst in.' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Niet geautoriseerd. Log eerst in.' });
    }

    if (!allowedRoles.includes(payload.role)) {
      return res.status(403).json({
        error: 'Onvoldoende rechten voor deze actie.'
      });
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  };
}

export function attachUserToRequest(req, res, next) {
  const token = req.cookies.auth_token;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      };
    }
  }

  next();
}
