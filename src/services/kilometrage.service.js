const Camion = require('../models/camion.model');
const Remorque = require('../models/remorque.model');
const AppError = require('../utils/AppError');

/** Règle : kmArrivee strictement supérieur à kmDepart (fonction pure, testable). */
exports.validerKilometrage = (kmDepart, kmArrivee) => {
  if (kmArrivee <= kmDepart) {
    throw new AppError(400, 'Le kilométrage d\'arrivée doit être strictement supérieur au kilométrage de départ.');
  }
  return kmArrivee - kmDepart;
};

/** Valide puis ajoute la distance au kilométrage cumulé du camion et de la remorque. */
exports.traiterKilometrage = async (camionId, remorqueId, kmDepart, kmArrivee) => {
  const distance = exports.validerKilometrage(kmDepart, kmArrivee);

  await Camion.findByIdAndUpdate(camionId, { $inc: { kmCumule: distance } });
  if (remorqueId) await Remorque.findByIdAndUpdate(remorqueId, { $inc: { kmCumule: distance } });

  return distance;
};