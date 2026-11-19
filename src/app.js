const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const authRoutes = require('./routes/auth.routes');
const camionRoutes = require('./routes/camion.routes');
const remorqueRoutes = require('./routes/remorque.routes');
const pneuRoutes = require('./routes/pneu.routes');
const chauffeurRoutes = require('./routes/chauffeur.routes');
const trajetRoutes = require('./routes/trajet.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API de Gestion de Flotte de Transport Routier - YouCode 2026/2027' });
});

app.use('/api/auth', authRoutes);
app.use('/api/camions', camionRoutes);
app.use('/api/remorques', remorqueRoutes);
app.use('/api/pneus', pneuRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/trajets', trajetRoutes);

// Route inconnue -> 404 JSON, puis gestion d'erreurs centralisée (toujours en dernier)
app.use((req, res, next) => next(new AppError(404, 'Route introuvable.')));
app.use(errorHandler);

module.exports = app;