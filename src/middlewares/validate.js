const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body || {}, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message).join(', ');
    return next(new AppError(400, `Erreur de validation : ${details}`));
  }
  req.body = value; // valeurs converties (dates, nombres)
  next();
};

module.exports = validate;