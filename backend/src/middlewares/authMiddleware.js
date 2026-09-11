const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const token = authorization.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token invalido o expirado' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  const roleIds = { Estudiante: 1, Docente: 2, Administrador: 3 };
  const userRole = Number(req.user?.rol);
  const hasPermission = roles.some((role) => Number(roleIds[role] || role) === userRole);

  if (!hasPermission) {
    return res.status(403).json({ message: 'Permisos insuficientes' });
  }
  next();
};

module.exports = { verifyToken, requireRole };
