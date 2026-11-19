const Trajet = require('../models/trajet.model');
const Camion = require('../models/camion.model');
const Remorque = require('../models/remorque.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const { checkAvailabilityAndStatus } = require('./availability.service');
const { validerKilometrage, traiterKilometrage } = require('./kilometrage.service');
const { calculerConsommationL100 } = require('./consommation.service');
const { estTransitionAvant, estRetourArriere } = require('../utils/trajetTransitions');
const { withLocks } = require('../utils/resourceLock');

const peupler = (query) => query
  .populate('chauffeur', 'nom email')
  .populate('camion', 'immatriculation marque modele')
  .populate('remorque', 'immatriculation type');

/** Charge le trajet et vérifie qu'un chauffeur n'accède qu'à ses propres trajets. */
const chargerTrajet = async (id, user) => {
  const trajet = await Trajet.findById(id);
  if (!trajet) throw new AppError(404, 'Trajet introuvable.');
  if (user.role === 'chauffeur' && trajet.chauffeur.toString() !== user.id) {
    throw new AppError(403, 'Accès non autorisé à ce trajet.');
  }
  return trajet;
};

/** Changement de statut ATOMIQUE : échoue (409) si le statut a changé entre-temps. */
const changerStatutAtomique = async (id, statutAttendu, maj) => {
  const trajet = await Trajet.findOneAndUpdate({ _id: id, statut: statutAttendu }, maj, { returnDocument: 'after' });
  if (!trajet) throw new AppError(409, `Transition impossible : le trajet n'est plus au statut ${statutAttendu}.`);
  return trajet;
};

const marquerVehicules = (trajet, statut, statutActuel) =>
  Promise.all([
    Camion.updateOne({ _id: trajet.camion, statut: statutActuel }, { statut }),
    Remorque.updateOne({ _id: trajet.remorque, statut: statutActuel }, { statut })
  ]);

exports.creerTrajet = async (data) => {
  const { chauffeur, camion, remorque, dateDebutPrevue, dateFinPrevue } = data;
  // Verrou sur les 3 ressources : deux créations simultanées ne peuvent pas passer ensemble
  return withLocks([[Camion, camion], [Remorque, remorque], [User, chauffeur]], async () => {
    await checkAvailabilityAndStatus(camion, remorque, chauffeur, dateDebutPrevue, dateFinPrevue);
    return Trajet.create({ ...data, statut: 'a_faire' });
  });
};

exports.listerTrajets = (user, query = {}) => {
  const filtre = {};
  if (user.role === 'chauffeur') filtre.chauffeur = user.id;
  if (typeof query.statut === 'string' && query.statut) filtre.statut = query.statut;
  return peupler(Trajet.find(filtre).sort({ dateDebutPrevue: 1 }));
};

exports.obtenirTrajet = async (id, user) => {
  await chargerTrajet(id, user);
  return peupler(Trajet.findById(id));
};

exports.demarrerTrajet = async (id, user, { kmDepart }) => {
  const trajet = await chargerTrajet(id, user);
  if (!estTransitionAvant(trajet.statut, 'en_cours')) {
    throw new AppError(409, `Transition interdite : ${trajet.statut} -> en_cours.`);
  }
  const maj = await changerStatutAtomique(id, 'a_faire', { statut: 'en_cours', kmDepart });
  await marquerVehicules(maj, 'en_trajet', 'disponible'); // ne touche pas un véhicule en maintenance
  return maj;
};

exports.terminerTrajet = async (id, user, { kmArrivee, volumeGasoil, remarque }) => {
  const trajet = await chargerTrajet(id, user);
  if (!estTransitionAvant(trajet.statut, 'termine')) {
    throw new AppError(409, `Transition interdite : ${trajet.statut} -> termine.`);
  }
  if (trajet.kmDepart === null || trajet.kmDepart === undefined) {
    throw new AppError(409, 'Le kilométrage de départ est manquant : démarrez le trajet d\'abord.');
  }

  validerKilometrage(trajet.kmDepart, kmArrivee); // 400 si kmArrivee <= kmDepart

  const maj = { statut: 'termine', kmArrivee, volumeGasoil };
  if (remarque) maj.remarque = remarque;
  const termine = await changerStatutAtomique(id, 'en_cours', maj);

  await traiterKilometrage(termine.camion, termine.remorque, termine.kmDepart, kmArrivee);
  await marquerVehicules(termine, 'disponible', 'en_trajet');

  return { trajet: termine, consommationL100: calculerConsommationL100(volumeGasoil, termine.kmDepart, kmArrivee) };
};

/** Retour arrière d'une étape : réservé à l'admin (la route est protégée par authorize('admin')). */
exports.revenirEnArriere = async (id, nouveauStatut) => {
  const trajet = await Trajet.findById(id);
  if (!trajet) throw new AppError(404, 'Trajet introuvable.');
  if (!estRetourArriere(trajet.statut, nouveauStatut)) {
    throw new AppError(409, `Retour arrière interdit : ${trajet.statut} -> ${nouveauStatut}.`);
  }

  if (trajet.statut === 'termine') {
    const maj = await changerStatutAtomique(id, 'termine', { statut: 'en_cours', kmArrivee: null, volumeGasoil: null });
    const distance = trajet.kmArrivee - trajet.kmDepart; // on annule le kilométrage ajouté à la clôture
    await Promise.all([
      Camion.updateOne({ _id: trajet.camion }, { $inc: { kmCumule: -distance } }),
      Remorque.updateOne({ _id: trajet.remorque }, { $inc: { kmCumule: -distance } })
    ]);
    await marquerVehicules(maj, 'en_trajet', 'disponible');
    return maj;
  }

  const maj = await changerStatutAtomique(id, 'en_cours', { statut: 'a_faire', kmDepart: null });
  await marquerVehicules(maj, 'disponible', 'en_trajet');
  return maj;
};