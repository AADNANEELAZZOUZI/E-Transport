const Pneu = require('../models/pneu.model');
const Camion = require('../models/camion.model');
const AppError = require('../utils/AppError');

const base = require('./crud.service')(Pneu, {
  nom: 'Pneu',
  filtrables: ['statut', 'camion'],
  archiverPar: { statut: 'remplace' } // un pneu n'est pas supprimé : il est marqué remplacé
});

module.exports = {
  ...base,
  // Association pneu <-> camion : le camion doit exister
  creer: async (data) => {
    if (!(await Camion.exists({ _id: data.camion, archive: false }))) throw new AppError(404, 'Camion introuvable.');
    return base.creer(data);
  }
};