const Remorque = require('../models/remorque.model');

module.exports = require('./crud.service')(Remorque, {
  nom: 'Remorque',
  baseFilter: { archive: false },
  filtrables: ['statut', 'immatriculation'],
  archiverPar: { archive: true }
});