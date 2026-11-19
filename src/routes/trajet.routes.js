const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajet.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createTrajetValidation, demarrerValidation, terminerValidation, statutValidation } = require('../validators/trajet.validator');

router.use(authenticate);

router.post('/', authorize('admin'), validate(createTrajetValidation), trajetController.createTrajet);
router.get('/', trajetController.getTrajets);
router.get('/:id', trajetController.getTrajet);

// Cycle de vie : a_faire -> en_cours -> termine (le chauffeur ne touche qu'à ses trajets, vérifié dans le service)
router.patch('/:id/demarrer', validate(demarrerValidation), trajetController.demarrerTrajet);
router.patch('/:id/terminer', validate(terminerValidation), trajetController.terminerTrajet);

// Retour arrière : admin uniquement
router.patch('/:id/statut', authorize('admin'), validate(statutValidation), trajetController.revenirEnArriere);

module.exports = router;