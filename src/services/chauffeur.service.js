const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const PROJECTION = '-motDePasseHash -refreshTokenHash -verrouJusquA';

exports.lister = (query = {}) => {
  const filtre = { role: 'chauffeur' };
  if (['actif', 'suspendu'].includes(query.statut)) filtre.statut = query.statut;
  return User.find(filtre).select(PROJECTION);
};

const changerStatut = async (id, statut) => {
  const maj = { statut };
  if (statut === 'suspendu') maj.refreshTokenHash = null; // coupe aussi le refresh token
  const user = await User.findOneAndUpdate({ _id: id, role: 'chauffeur' }, maj, { returnDocument: 'after' }).select(PROJECTION);
  if (!user) throw new AppError(404, 'Chauffeur introuvable.');
  return user;
};

exports.suspendre = (id) => changerStatut(id, 'suspendu');
exports.reactiver = (id) => changerStatut(id, 'actif');