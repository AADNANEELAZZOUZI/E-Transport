const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

// Express 5 transmet automatiquement les erreurs d'une fonction async à errorHandler
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Accès refusé. Token manquant.');
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch (e) {
    throw new AppError(401, 'Token expiré ou invalide.');
  }

  // On relit l'utilisateur : un compte suspendu perd l'accès immédiatement
  const user = await User.findById(decoded.id).select('role statut');
  if (!user) throw new AppError(401, 'Utilisateur introuvable.');
  if (user.statut === 'suspendu') throw new AppError(403, 'Compte suspendu. Contactez l\'administrateur.');

  req.user = { id: user._id.toString(), role: user.role };
  next();
};

module.exports = authenticate;