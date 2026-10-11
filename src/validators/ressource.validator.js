const Joi = require('joi');

const camionValidation = Joi.object({
  immatriculation: Joi.string().required(),
  marque: Joi.string().required(),
  modele: Joi.string().required(),
  kmCumule: Joi.number().min(0).optional()
});

const remorqueValidation = Joi.object({
  immatriculation: Joi.string().required(),
  type: Joi.string().required(),
  kmCumule: Joi.number().min(0).optional()
});

const pneuValidation = Joi.object({
  position: Joi.string().required(),
  seuilKm: Joi.number().required(),
  camion: Joi.string().required() // ID du camion associé
});

module.exports = {
  camionValidation,
  remorqueValidation,
  pneuValidation
};