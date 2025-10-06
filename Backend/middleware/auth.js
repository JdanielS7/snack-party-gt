const jwt = require('jsonwebtoken');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      // Log mínimo para diagnóstico sin exponer detalles al cliente
      console.warn('JWT verify failed:', err?.name || err?.message);
      const message = err?.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
      return res.status(403).json({ error: message });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'Admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' });
  }
  next();
};

// Middleware para verificar rol de admin o staff
const requireAdminOrStaff = (req, res, next) => {
  if (!['Admin', 'Staff'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Se requieren permisos de administrador o staff' });
  }
  next();
};

// Middleware para verificar rol de staff o superior
const requireStaffOrAdmin = (req, res, next) => {
  if (!['Admin', 'Staff'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Se requieren permisos de staff o administrador' });
  }
  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrStaff,
  requireStaffOrAdmin,
  optionalAuth
};


