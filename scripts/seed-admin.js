// Crée le premier compte admin : npm run seed:admin
// Variables requises dans .env : MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/user.model');

(async () => {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('MONGO_URI, ADMIN_EMAIL et ADMIN_PASSWORD sont requis dans .env');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  if (await User.findOne({ email: ADMIN_EMAIL })) {
    console.log('Admin déjà existant, rien à faire.');
  } else {
    await User.create({
      nom: 'Administrateur',
      email: ADMIN_EMAIL,
      motDePasseHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'admin'
    });
    console.log(`Admin créé : ${ADMIN_EMAIL}`);
  }
  await mongoose.disconnect();
})();