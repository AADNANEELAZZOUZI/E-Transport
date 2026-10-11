const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasseHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'chauffeur'], 
    required: true 
  },
  statut: { 
    type: String, 
    enum: ['actif', 'suspendu'], 
    default: 'actif' 
  },
  refreshTokenHash: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
