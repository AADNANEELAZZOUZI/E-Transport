const { AsyncLocalStorage } = require('node:async_hooks');

// Contexte propagé automatiquement à tout le cycle de vie d'une requête (requestId, userId)
const als = new AsyncLocalStorage();

exports.runWithContext = (contexte, fn) => als.run(contexte, fn);
exports.getContext = () => als.getStore() || {};
exports.setContext = (valeurs) => {
  const store = als.getStore();
  if (store) Object.assign(store, valeurs);
};