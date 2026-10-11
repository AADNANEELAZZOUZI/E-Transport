const mongoose = require('mongoose');

const pneuSchema = new mongoose.Schema({
  position: { type: String, required: true }, // ex: avant-gauche, arriere-droite, etc.
  kmUsure: { type: Number, default: 0 },
  seuilKm: { type: Number, required: true }, // Seuil limite avant alerte de remplacement
  statut: { 
    type: String, 
    enum: ['bon', 'alerte', 'remplace'], 
    default: 'bon' 
  },
  camion: { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Pneu', pneuSchema);