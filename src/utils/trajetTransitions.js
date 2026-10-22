// Ordre strict du cycle de vie d'un trajet : à faire -> en cours -> terminé
const ORDRE = ['a_faire', 'en_cours', 'termine'];
const index = (statut) => ORDRE.indexOf(statut);

/** Vrai uniquement pour l'étape suivante (pas de saut, pas de retour). */
exports.estTransitionAvant = (de, vers) => index(de) !== -1 && index(vers) === index(de) + 1;

/** Vrai uniquement pour un retour d'une étape (réservé à l'admin). */
exports.estRetourArriere = (de, vers) => index(de) !== -1 && index(vers) !== -1 && index(vers) === index(de) - 1;

exports.ORDRE = ORDRE;