const Trajet = require('../models/trajet.model');
const { checkAvailabilityAndStatus } = require('../services/availability.service');

// Créer et assigner un trajet (Admin uniquement)
exports.createTrajet = async (req, res) => {
  try {
    const { siteDepart, siteArrivee, marchandise, dateDebutPrevue, dateFinPrevue, chauffeur, camion, remorque } = req.body;

    // Appel du service unique de disponibilité (DRY) -> Lève une erreur 409 ou 404 en cas de problème
    await checkAvailabilityAndStatus(camion, remorque, chauffeur, dateDebutPrevue, dateFinPrevue);

    const trajet = await Trajet.create({
      siteDepart,
      siteArrivee,
      marchandise,
      dateDebutPrevue,
      dateFinPrevue,
      chauffeur,
      camion,
      remorque,
      statut: 'a_faire'
    });

    res.status(201).json({ message: 'Trajet créé et assigné avec succès', trajet });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Erreur serveur' });
  }
};

// Consulter les trajets (Admin voit tout, Chauffeur ne voit que les siens)
exports.getTrajets = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'chauffeur') {
      filter.chauffeur = req.user.id;
    }

    const trajets = await Trajet.find(filter)
      .populate('chauffeur', 'nom email')
      .populate('camion', 'immatriculation marque modele')
      .populate('remorque', 'immatriculation type');

    res.json(trajets);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};