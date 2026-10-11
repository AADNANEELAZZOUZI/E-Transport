const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema({
  siteDepart: { type: String, required: true },
  siteArrivee: { type: String, required: true },
  marchandise: { type: String, required: true },
  dateDebutPrevue: { type: Date, required: true },
  dateFinPrevue: { type: Date, required: true },
  statut: { 
    type: String, 
    enum: ['a_faire', 'en_cours', 'termine'], 
    default: 'a_faire' 
  },
  chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  camion: { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', required: true },
  remorque: { type: mongoose.Schema.Types.ObjectId, ref: 'Remorque', required: true },
  
  // Champs de suivi (saisis plus tard par le chauffeur)
  kmDepart: { type: Number, default: null },
  kmArrivee: { type: Number, default: null },
  volumeGasoil: { type: Number, default: null },
  remarque: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Trajet', trajetSchema);