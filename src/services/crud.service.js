const AppError = require('../utils/AppError');

const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**²    
 * Fabrique un service CRUD pour une ressource (camion, remorque, pneu).
 * - baseFilter : filtre toujours appliqué (ex. { archive: false })
 * - filtrables : champs filtrables via la query string (?statut=...&immatriculation=...)
 * - archiverPar : mise à jour appliquée à l'archivage (soft delete)
 */
module.exports = (Model, { nom, baseFilter = {}, filtrables = [], archiverPar }) => {
  const introuvable = () => new AppError(404, `${nom} introuvable.`);

  return {
    creer: (data) => Model.create(data),

    lister: (query = {}) => {
      const filtre = { ...baseFilter };
      for (const champ of filtrables) {
        const valeur = query[champ];
        if (typeof valeur !== 'string' || !valeur) continue; // refuse les objets/tableaux (injection NoSQL)
        filtre[champ] = champ === 'immatriculation' ? { $regex: echapper(valeur), $options: 'i' } : valeur;
      }
      return Model.find(filtre);
    },

    obtenir: async (id) => {
      const doc = await Model.findOne({ _id: id, ...baseFilter });
      if (!doc) throw introuvable();
      return doc;
    },

    modifier: async (id, data) => {
      const doc = await Model.findOneAndUpdate({ _id: id, ...baseFilter }, data, { returnDocument: 'after', runValidators: true });
      if (!doc) throw introuvable();
      return doc;
    },

    archiver: async (id) => {
      const doc = await Model.findOneAndUpdate({ _id: id, ...baseFilter }, archiverPar, { returnDocument: 'after' });
      if (!doc) throw introuvable();
      return doc;
    }
  };
};