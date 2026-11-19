require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Aucun secret en dur : on refuse de démarrer si une variable obligatoire manque
['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach((cle) => {
  if (!process.env[cle]) {
    console.error(`Variable d'environnement manquante : ${cle}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

const demarrer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
};

demarrer();