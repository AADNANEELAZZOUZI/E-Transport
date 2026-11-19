const express = require('express');
const router = express.Router();
const chauffeurController = require('../controllers/chauffeur.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.use(authenticate, authorize('admin'));
router.get('/', chauffeurController.list);
router.patch('/:id/suspendre', chauffeurController.suspendre);
router.patch('/:id/reactiver', chauffeurController.reactiver);

module.exports = router;