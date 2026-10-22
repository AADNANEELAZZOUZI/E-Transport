const Trajet = require('../models/trajet.model');
const Camion = require('../models/camion.model');
const Remorque = require('../models/remorque.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

/**
 * Service UNIQUE de vérification de disponibilité (DRY) : utilisé à la création
 * ET à la modification d'un trajet.
 * Règle de chevauchement : debut < autreFin && fin > autreDebut
 */
exports.checkAvailabilityAndStatus = async (camionId, remorqueId, chauffeurId, dateDebut, dateFin, excludeTrajetId = null) => {
  if (new Date(dateFin) <= new Date(dateDebut)) {
    throw new AppError(400, 'La date de fin doit être postérieure à la date de début.');
  }

  // 1. Camion (existence, archivage, maintenance)
  const camion = await Camion.findById(camionId);
  if (!camion || camion.archive) throw new AppError(404, 'Camion introuvable ou archivé.');
  if (camion.statut === 'maintenance') throw new AppError(409, 'Le camion est actuellement en maintenance et ne peut être assigné.');

  // 2. Remorque (existence, archivage, maintenance)
  const remorque = await Remorque.findById(remorqueId);
  if (!remorque || remorque.archive) throw new AppError(404, 'Remorque introuvable ou archivée.');
  if (remorque.statut === 'maintenance') throw new AppError(409, 'La remorque est actuellement en maintenance et ne peut être assignée.');

  // 3. Chauffeur (existence, suspension)
  const chauffeur = await User.findById(chauffeurId);
  if (!chauffeur || chauffeur.role !== 'chauffeur') throw new AppError(404, 'Chauffeur introuvable.');
  if (chauffeur.statut === 'suspendu') throw new AppError(409, 'Impossible d\'assigner un trajet à un chauffeur suspendu.');

  // 4. Chevauchements de planning (trajets non terminés)
  const query = {
    statut: { $ne: 'termine' },
    dateDebutPrevue: { $lt: new Date(dateFin) },
    dateFinPrevue: { $gt: new Date(dateDebut) },
    $or: [{ camion: camionId }, { remorque: remorqueId }, { chauffeur: chauffeurId }]
  };
  if (excludeTrajetId) query._id = { $ne: excludeTrajetId };

  const conflit = await Trajet.findOne(query);
  if (conflit) {
    let ressource = 'Une ressource';
    if (conflit.camion.toString() === camionId.toString()) ressource = 'Le camion';
    else if (conflit.remorque.toString() === remorqueId.toString()) ressource = 'La remorque';
    else if (conflit.chauffeur.toString() === chauffeurId.toString()) ressource = 'Le chauffeur';
    throw new AppError(409, `${ressource} est déjà assigné sur un autre trajet actif durant cette période.`);
  }

  // TODO (maintenance) : bloquer ici si alerte ouverte ou pneu au-delà du seuil
  return true;
};