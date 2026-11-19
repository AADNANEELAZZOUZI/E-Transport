const Joi = require('joi');

const email = Joi.string().email({ tlds: { allow: false } }).required();

const registerValidation = Joi.object({
  nom: Joi.string().trim().min(2).required(),
  email,
  motDePasse: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'chauffeur').default('chauffeur')
});

const loginValidation = Joi.object({
  email,
  motDePasse: Joi.string().required()
});

const refreshValidation = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = { registerValidation, loginValidation, refreshValidation };