/**
 * Calcule la consommation moyenne en L/100 km (fonction pure et testable).
 */
exports.calculerConsommationL100 = (volumeGasoil, kmDepart, kmArrivee) => {
  const distance = kmArrivee - kmDepart;

  if (distance <= 0 || !volumeGasoil || volumeGasoil <= 0) {
    return 0;
  }

  const consommation = (volumeGasoil / distance) * 100;
  return parseFloat(consommation.toFixed(2)); // arrondi à 2 décimales
};