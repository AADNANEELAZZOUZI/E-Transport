const chauffeurService = require('../services/chauffeur.service');

exports.list = async (req, res) => res.json(await chauffeurService.lister(req.query));

exports.suspendre = async (req, res) => {
  const chauffeur = await chauffeurService.suspendre(req.params.id);
  res.json({ message: 'Compte chauffeur suspendu', chauffeur });
};

exports.reactiver = async (req, res) => {
  const chauffeur = await chauffeurService.reactiver(req.params.id);
  res.json({ message: 'Compte chauffeur réactivé', chauffeur });
};