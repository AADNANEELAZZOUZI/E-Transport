const { pneuValidation, pneuUpdateValidation } = require('../validators/ressource.validator');

module.exports = require('./crud.routes')(require('../controllers/pneu.controller'), {
  creation: pneuValidation,
  modification: pneuUpdateValidation
});