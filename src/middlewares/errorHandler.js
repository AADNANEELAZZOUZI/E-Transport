// Middleware centralisé de gestion d'erreurs : un seul endroit pour les codes HTTP
module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Erreur de validation', details: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant invalide.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Cette valeur existe déjà (doublon).' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalide.' });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err); // sera remplacé par Winston en v2
  res.status(status).json({ message: status === 500 ? 'Erreur serveur' : err.message });
};