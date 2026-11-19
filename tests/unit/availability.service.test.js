const mockingoose = require('mockingoose').default || require('mockingoose');
const mongoose = require('mongoose');

const Camion = require('../../src/models/camion.model');
const Remorque = require('../../src/models/remorque.model');
const User = require('../../src/models/user.model');
const Trajet = require('../../src/models/trajet.model');

const availabilityService = require('../../src/services/availability.service');

describe('Availability Service - checkAvailabilityAndStatus', () => {
  const camionId = new mongoose.Types.ObjectId().toString();
  const remorqueId = new mongoose.Types.ObjectId().toString();
  const chauffeurId = new mongoose.Types.ObjectId().toString();
  const dateDebut = '2026-11-01T08:00:00Z';
  const dateFin = '2026-11-01T18:00:00Z';

  const appeler = () => availabilityService.checkAvailabilityAndStatus(camionId, remorqueId, chauffeurId, dateDebut, dateFin);
  const tousDisponibles = () => {
    mockingoose(Camion).toReturn({ _id: camionId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(Remorque).toReturn({ _id: remorqueId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(User).toReturn({ _id: chauffeurId, role: 'chauffeur', statut: 'actif' }, 'findOne');
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('1. Lève 404 si le camion est introuvable ou archivé', async () => {
    mockingoose(Camion).toReturn(null, 'findOne');
    await expect(appeler()).rejects.toMatchObject({ status: 404, message: 'Camion introuvable ou archivé.' });
  });

  it('2. Lève 409 si le camion est en maintenance', async () => {
    mockingoose(Camion).toReturn({ _id: camionId, statut: 'maintenance', archive: false }, 'findOne');
    await expect(appeler()).rejects.toMatchObject({ status: 409, message: 'Le camion est actuellement en maintenance et ne peut être assigné.' });
  });

  it('3. Lève 409 si la remorque est en maintenance', async () => {
    mockingoose(Camion).toReturn({ _id: camionId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(Remorque).toReturn({ _id: remorqueId, statut: 'maintenance', archive: false }, 'findOne');
    await expect(appeler()).rejects.toMatchObject({ status: 409 });
  });

  it('4. Lève 404 si le chauffeur est introuvable', async () => {
    mockingoose(Camion).toReturn({ _id: camionId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(Remorque).toReturn({ _id: remorqueId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(User).toReturn(null, 'findOne');
    await expect(appeler()).rejects.toMatchObject({ status: 404, message: 'Chauffeur introuvable.' });
  });

  it('5. Lève 409 si le chauffeur est suspendu', async () => {
    mockingoose(Camion).toReturn({ _id: camionId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(Remorque).toReturn({ _id: remorqueId, statut: 'disponible', archive: false }, 'findOne');
    mockingoose(User).toReturn({ _id: chauffeurId, role: 'chauffeur', statut: 'suspendu' }, 'findOne');
    await expect(appeler()).rejects.toMatchObject({ status: 409 });
  });

  it('6. Lève 409 en cas de chevauchement de planning pour le camion', async () => {
    tousDisponibles();
    mockingoose(Trajet).toReturn({
      _id: new mongoose.Types.ObjectId().toString(),
      camion: camionId,
      remorque: new mongoose.Types.ObjectId().toString(),
      chauffeur: new mongoose.Types.ObjectId().toString()
    }, 'findOne');
    await expect(appeler()).rejects.toMatchObject({
      status: 409,
      message: 'Le camion est déjà assigné sur un autre trajet actif durant cette période.'
    });
  });

  it('7. Lève 400 si la date de fin précède la date de début', async () => {
    await expect(
      availabilityService.checkAvailabilityAndStatus(camionId, remorqueId, chauffeurId, dateFin, dateDebut)
    ).rejects.toMatchObject({ status: 400 });
  });

  it('8. Retourne true si tout est disponible et sans conflit', async () => {
    tousDisponibles();
    mockingoose(Trajet).toReturn(null, 'findOne');
    await expect(appeler()).resolves.toBe(true);
  });
});