const Camion = require('../models/camion.model');

module.exports = require('./crud.service')(Camion, {
  nom: 'Camion',
  baseFilter: { archive: false },
  filtrables: ['statut', 'immatriculation'],
  archiverPar: { archive: true }
});