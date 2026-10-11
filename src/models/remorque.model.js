const mongoose = require('mongoose');

const remorqueSchema = new mongoose.Schema({
  immatriculation: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  kmCumule: { type: Number, default: 0 },
  statut: { type: String, enum: ['disponible', 'maintenance', 'en_trajet'], default: 'disponible' },
  archive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Remorque', remorqueSchema);