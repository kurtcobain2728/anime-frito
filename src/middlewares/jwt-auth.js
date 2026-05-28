const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/api-error');

const JWT_SECRET = process.env.JWT_SECRET || 'animefrito_super_secret_key';

function requireJwtAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token requerido'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Token inválido o expirado'));
  }
}

function requireSuperAdmin(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Token requerido'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'superadmin') {
      return next(new ApiError(403, 'Acceso denegado. Se requiere rol superadmin'));
    }
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Token inválido o expirado'));
  }
}

module.exports = { requireJwtAuth, requireSuperAdmin };
