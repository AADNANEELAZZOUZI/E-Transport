const express = require('express');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');

/** Routes REST standard : lecture pour tout utilisateur connecté, écriture réservée à l'admin. */
module.exports = (controller, { creation, modification }) => {
  const router = express.Router();
  router.use(authenticate);
  router.get('/', controller.list);
  router.get('/:id', controller.getOne);
  router.post('/', authorize('admin'), validate(creation), controller.create);
  router.put('/:id', authorize('admin'), validate(modification), controller.update);
  router.delete('/:id', authorize('admin'), controller.archive);
  return router;
};