const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createTrajetValidation = Joi.object({
  siteDepart: Joi.string().trim().required(),
  siteArrivee: Joi.string().trim().required(),
  marchandise: Joi.string().trim().required(),
  dateDebutPrevue: Joi.date().iso().required(),
  dateFinPrevue: Joi.date().iso().greater(Joi.ref('dateDebutPrevue')).required()
    .messages({ 'date.greater': 'dateFinPrevue doit être postérieure à dateDebutPrevue' }),
  chauffeur: objectId.required(),
  camion: objectId.required(),
  remorque: objectId.required()
});

const demarrerValidation = Joi.object({
  kmDepart: Joi.number().min(0).required()
});

const terminerValidation = Joi.object({
  kmArrivee: Joi.number().min(0).required(),
  volumeGasoil: Joi.number().min(0).required(),
  remarque: Joi.string().allow('').max(500).optional()
});

// Retour arrière (admin) : on ne peut viser que a_faire ou en_cours
const statutValidation = Joi.object({
  statut: Joi.string().valid('a_faire', 'en_cours').required()
});

module.exports = { createTrajetValidation, demarrerValidation, terminerValidation, statutValidation };