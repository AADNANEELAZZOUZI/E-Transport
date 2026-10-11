const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit. Rôle insuffisant.' });
    }
    next();
  };
};

module.exports = authorize;