const Trajet = require('../models/trajet.model');
const Camion = require('../models/camion.model');
const Remorque = require('../models/remorque.model');
const User = require('../models/user.model');

/**
 * Vérifie la disponibilité des ressources pour une période donnée.
 * Règle de chevauchement : debut < autreFin && fin > autreDebut
 */
exports.checkAvailabilityAndStatus = async (camionId, remorqueId, chauffeurId, dateDebut, dateFin, excludeTrajetId = null) => {
  
  // 1. Vérifier le Camion (existence, statut maintenance, archivage)
  const camion = await Camion.findById(camionId);
  if (!camion || camion.archive) throw { status: 404, message: 'Camion introuvable ou archivé.' };
  if (camion.statut === 'maintenance') throw { status: 409, message: 'Le camion est actuellement en maintenance et ne peut être assigné.' };

  // 2. Vérifier la Remorque (existence, statut maintenance, archivage)
  const remorque = await Remorque.findById(remorqueId);
  if (!remorque || remorque.archive) throw { status: 404, message: 'Remorque introuvable ou archivée.' };
  if (remorque.statut === 'maintenance') throw { status: 409, message: 'La remorque est actuellement en maintenance et ne peut être assignée.' };

  // 3. Vérifier le Chauffeur (existence, statut actif/suspendu)
  const chauffeur = await User.findById(chauffeurId);
  if (!chauffeur || chauffeur.role !== 'chauffeur') throw { status: 404, message: 'Chauffeur introuvable.' };
  if (chauffeur.statut === 'suspendu') throw { status: 409, message: 'Impossible d\'assigner un trajet à un chauffeur suspendu.' };

  // 4. Vérifier les chevauchements de planning (Trajets actifs non terminés)
  // Condition de chevauchement de périodes : (StartA < EndB) et (EndA > StartB)
//   SELECT *
// FROM trajets
// WHERE statut <> 'termine'
//   AND date_debut_prevue < :date_fin
//   AND date_fin_prevue > :date_debut
//   AND (
//       camion_id = :camion_id
//       OR remorque_id = :remorque_id
//       OR chauffeur_id = :chauffeur_id
//   )
// LIMIT 1;
  const query = {
    statut: { $ne: 'termine' }, // Ignore les trajets déjà terminés
    dateDebutPrevue: { $lt: new Date(dateFin) },
    dateFinPrevue: { $gt: new Date(dateDebut) },$or: [
      { camion: camionId },
      { remorque: remorqueId },
      { chauffeur: chauffeurId }
    ]
  };

  if (excludeTrajetId) {
    query._id = { $ne: excludeTrajetId };
  }

  const conflictingTrajet = await Trajet.findOne(query);

  if (conflictingTrajet) {
    let conflictType = 'Ressource';
    if (conflictingTrajet.camion.toString() === camionId) conflictType = 'Le camion';
    else if (conflictingTrajet.remorque.toString() === remorqueId) conflictType = 'La remorque';
    else if (conflictingTrajet.chauffeur.toString() === chauffeurId) conflictType = 'Le chauffeur';

    throw { 
      status: 409, 
      message: `${conflictType} est déjà assigné sur un autre trajet actif durant cette période.` 
    };
  }

  return true;
};