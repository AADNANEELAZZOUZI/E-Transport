const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: 'Utilisateur créé avec succès', user });
};

exports.login = async (req, res) => {
  const resultat = await authService.login(req.body);
  res.json({ message: 'Connexion réussie', ...resultat });
};

exports.refresh = async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
};

exports.logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.json({ message: 'Déconnexion réussie' });
};