const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const camionRoutes = require('./routes/camion.routes');
const trajetRoutes = require('./routes/trajet.routes');
// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données MongoDB
connectDB();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Route de test basique
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestion de Flotte de Transport Routier - YouCode 2026/2027 en marche 🚀' });
});

app.use('/api/camions', camionRoutes);
app.use('/api/trajets', trajetRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});