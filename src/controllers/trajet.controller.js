const trajetService = require('../services/trajet.service');

exports.createTrajet = async (req, res) => {
  const trajet = await trajetService.creerTrajet(req.body);
  res.status(201).json({ message: 'Trajet créé et assigné avec succès', trajet });
};

exports.getTrajets = async (req, res) => res.json(await trajetService.listerTrajets(req.user, req.query));

exports.getTrajet = async (req, res) => res.json(await trajetService.obtenirTrajet(req.params.id, req.user));

exports.demarrerTrajet = async (req, res) => {
  const trajet = await trajetService.demarrerTrajet(req.params.id, req.user, req.body);
  res.json({ message: 'Trajet démarré', trajet });
};

exports.terminerTrajet = async (req, res) => {
  const { trajet, consommationL100 } = await trajetService.terminerTrajet(req.params.id, req.user, req.body);
  res.json({ message: 'Trajet clôturé avec succès', trajet, consommationL100 });
};

exports.revenirEnArriere = async (req, res) => {
  const trajet = await trajetService.revenirEnArriere(req.params.id, req.body.statut);
  res.json({ message: 'Statut du trajet modifié par l\'administrateur', trajet });
};