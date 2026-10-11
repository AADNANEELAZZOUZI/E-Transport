const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajet.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.post('/', authenticate, authorize('admin'), trajetController.createTrajet);
router.get('/', authenticate, trajetController.getTrajets);

module.exports = router;