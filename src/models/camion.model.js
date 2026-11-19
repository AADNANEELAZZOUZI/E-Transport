const mongoose = require('mongoose');

const camionSchema = new mongoose.Schema({
  immatriculation: { type: String, required: true, unique: true },
  marque: { type: String, required: true },
  modele: { type: String, required: true },
  kmCumule: { type: Number, default: 0 },
  statut: { type: String, enum: ['disponible', 'maintenance', 'en_trajet'], default: 'disponible' },
  archive: { type: Boolean, default: false },
  verrouJusquA: { type: Date, default: null } // verrou d'assignation (voir utils/resourceLock.js)
}, { timestamps: true });

module.exports = mongoose.model('Camion', camionSchema);