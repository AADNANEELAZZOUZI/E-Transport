const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// gnr Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, statut: user.statut },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Inscription
exports.register = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, salt);

    const newUser = await User.create({
      nom,
      email,
      motDePasseHash,
      role: role || 'chauffeur',
      statut: 'actif'
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: newUser._id, nom: newUser.nom, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    //chauffeur suspendu ne peut pas se connecter
    if (user.statut === 'suspendu') {
      return res.status(403).json({ message: 'Votre compte a été suspendu. Contactez l\'administrateur.' });
    }

    const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasseHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      message: 'Connexion réussie',
      accessToken,
      user: { id: user._id, nom: user.nom, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};