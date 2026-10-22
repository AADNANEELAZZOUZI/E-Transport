/** Contrôleur générique : aucune logique métier, il appelle seulement le service. */
module.exports = (service, nom) => ({
  create: async (req, res) => {
    const data = await service.creer(req.body);
    res.status(201).json({ message: `${nom} créé avec succès`, data });
  },
  list: async (req, res) => res.json(await service.lister(req.query)),
  getOne: async (req, res) => res.json(await service.obtenir(req.params.id)),
  update: async (req, res) => {
    const data = await service.modifier(req.params.id, req.body);
    res.json({ message: `${nom} modifié avec succès`, data });
  },
  archive: async (req, res) => {
    const data = await service.archiver(req.params.id);
    res.json({ message: `${nom} archivé avec succès`, data });
  }
});