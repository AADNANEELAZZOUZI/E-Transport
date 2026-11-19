const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const statutVehicule = Joi.string().valid('disponible', 'maintenance', 'en_trajet');

const camionValidation = Joi.object({
  immatriculation: Joi.string().trim().required(),
  marque: Joi.string().required(),
  modele: Joi.string().required(),
  kmCumule: Joi.number().min(0).optional(),
  statut: statutVehicule.optional()
});

const remorqueValidation = Joi.object({
  immatriculation: Joi.string().trim().required(),
  type: Joi.string().required(),
  kmCumule: Joi.number().min(0).optional(),
  statut: statutVehicule.optional()
});

const pneuValidation = Joi.object({
  position: Joi.string().required(),
  seuilKm: Joi.number().min(1).required(),
  kmUsure: Joi.number().min(0).optional(),
  statut: Joi.string().valid('bon', 'alerte', 'remplace').optional(),
  camion: objectId.required() // ID du camion associé
});

// Pour les PUT : tous les champs deviennent optionnels, mais au moins un est requis
const camionUpdateValidation = camionValidation.fork(['immatriculation', 'marque', 'modele'], (s) => s.optional()).min(1);
const remorqueUpdateValidation = remorqueValidation.fork(['immatriculation', 'type'], (s) => s.optional()).min(1);
const pneuUpdateValidation = pneuValidation.fork(['position', 'seuilKm', 'camion'], (s) => s.optional()).min(1);

module.exports = {
  camionValidation, remorqueValidation, pneuValidation,
  camionUpdateValidation, remorqueUpdateValidation, pneuUpdateValidation
};