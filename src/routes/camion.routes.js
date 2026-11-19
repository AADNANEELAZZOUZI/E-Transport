const { camionValidation, camionUpdateValidation } = require('../validators/ressource.validator');

module.exports = require('./crud.routes')(require('../controllers/camion.controller'), {
  creation: camionValidation,
  modification: camionUpdateValidation
});