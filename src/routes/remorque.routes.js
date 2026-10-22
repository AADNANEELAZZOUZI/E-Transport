const { remorqueValidation, remorqueUpdateValidation } = require('../validators/ressource.validator');

module.exports = require('./crud.routes')(require('../controllers/remorque.controller'), {
  creation: remorqueValidation,
  modification: remorqueUpdateValidation
});