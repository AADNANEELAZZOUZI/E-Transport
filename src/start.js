require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

connectDB();
app.listen(process.env.PORT || 3000, () =>
  console.log(`API prête sur :${process.env.PORT || 3000}`));