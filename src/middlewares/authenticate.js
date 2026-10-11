const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant ou invalide.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contient id, role, statut, etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token expiré ou invalide.' });
  }
};

module.exports = authenticate;