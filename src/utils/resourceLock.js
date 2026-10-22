const AppError = require('./AppError');

const DUREE_VERROU_MS = 10000; // le verrou expire seul si le serveur plante

/**
 * Prend un verrou atomique sur un document (une seule requête gagne).
 * Retourne true si le verrou est pris, false si le document n'existe pas
 * (le 404 sera renvoyé par availabilityService), et lève un 409 sinon.
 */
const acquerir = async (Model, id) => {
  const maintenant = new Date();
  const doc = await Model.findOneAndUpdate(
    { _id: id, $or: [{ verrouJusquA: null }, { verrouJusquA: { $lt: maintenant } }] },
    { verrouJusquA: new Date(maintenant.getTime() + DUREE_VERROU_MS) },
    { returnDocument: 'after' }
  );
  if (doc) return true;
  const existe = await Model.exists({ _id: id });
  if (!existe) return false;
  throw new AppError(409, 'Une assignation est déjà en cours sur cette ressource, réessayez.');
};

/**
 * Exécute fn() en ayant verrouillé toutes les ressources [[Model, id], ...].
 * Deux requêtes concurrentes sur la même ressource : la seconde reçoit 409.
 */
exports.withLocks = async (ressources, fn) => {
  const acquis = [];
  try {
    for (const [Model, id] of ressources) {
      if (await acquerir(Model, id)) acquis.push([Model, id]);
    }
    return await fn();
  } finally {
    await Promise.allSettled(acquis.map(([Model, id]) => Model.updateOne({ _id: id }, { verrouJusquA: null })));
  }
};