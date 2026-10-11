const express = require('express');
const router = express.Router();
const camionController = require('../controllers/camion.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { camionValidation } = require('../validators/ressource.validator');

router.post('/', authenticate, authorize('admin'), validate(camionValidation), camionController.createCamion);
router.get('/', authenticate, camionController.getCamions);
router.delete('/:id', authenticate, authorize('admin'), camionController.archiveCamion);

module.exports = router;