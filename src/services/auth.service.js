const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

// sha256 (et non bcrypt) pour le refresh token : bcrypt tronque après 72 octets, un JWT est plus long
const sha256 = (valeur) => crypto.createHash('sha256').update(valeur).digest('hex');

const signerAccess = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
  });

const signerRefresh = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d'
  });

const emettreTokens = async (user) => {
  const accessToken = signerAccess(user);
  const refreshToken = signerRefresh(user);
  user.refreshTokenHash = sha256(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

const publicUser = (user) => ({ id: user._id, nom: user.nom, email: user.email, role: user.role, statut: user.statut });

exports.register = async ({ nom, email, motDePasse, role }) => {
  if (await User.findOne({ email })) throw new AppError(409, 'Cet email est déjà utilisé.');
  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const user = await User.create({ nom, email, motDePasseHash, role: role || 'chauffeur', statut: 'actif' });
  return publicUser(user);
};

exports.login = async ({ email, motDePasse }) => {
  const user = await User.findOne({ email });
  const motDePasseValide = user && (await bcrypt.compare(motDePasse, user.motDePasseHash));
  if (!motDePasseValide) throw new AppError(401, 'Email ou mot de passe incorrect.');
  if (user.statut === 'suspendu') throw new AppError(403, 'Votre compte a été suspendu. Contactez l\'administrateur.');

  const tokens = await emettreTokens(user);
  return { ...tokens, user: publicUser(user) };
};

exports.refresh = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    throw new AppError(401, 'Refresh token expiré ou invalide.');
  }
  const user = await User.findById(decoded.id);
  if (!user || user.refreshTokenHash !== sha256(refreshToken)) {
    throw new AppError(401, 'Refresh token invalide ou déjà utilisé.');
  }
  if (user.statut === 'suspendu') throw new AppError(403, 'Compte suspendu.');
  return emettreTokens(user); // rotation : l'ancien refresh token ne marche plus
};

exports.logout = async (userId) => {
  await User.updateOne({ _id: userId }, { refreshTokenHash: null });
};