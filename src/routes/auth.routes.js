const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { registerValidation, loginValidation, refreshValidation } = require('../validators/auth.validator');

router.post('/login', validate(loginValidation), authController.login);
router.post('/refresh', validate(refreshValidation), authController.refresh);
router.post('/logout', authenticate, authController.logout);
// Création de comptes : réservée à l'admin (sinon n'importe qui pourrait se créer admin)
router.post('/register', authenticate, authorize('admin'), validate(registerValidation), authController.register);

module.exports = router;