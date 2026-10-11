const Camion = require('../models/camion.model');

// Créer un camion (Admin)
exports.createCamion = async (req, res) => {
  try {
    const camion = await Camion.create(req.body);
    res.status(201).json({ message: 'Camion créé avec succès', camion });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Lister les camions non archivés
exports.getCamions = async (req, res) => {
  try {
    const camions = await Camion.find({ archive: false });
    res.json(camions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Archiver un camion (Soft Delete)
exports.archiveCamion = async (req, res) => {
  try {
    const camion = await Camion.findByIdAndUpdate(
      req.params.id, 
      { archive: true }, 
      { new: true }
    );
    if (!camion) return res.status(404).json({ message: 'Camion introuvable' });
    res.json({ message: 'Camion archivé avec succès', camion });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};