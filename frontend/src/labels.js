export const STATUT_USER = { actif: 'Actif', suspendu: 'Suspendu' }
export const STATUT_CAMION = { disponible: 'Disponible', maintenance: 'En maintenance', en_trajet: 'En trajet' }
export const STATUT_TRAJET = { a_faire: 'À faire', en_cours: 'En cours', termine: 'Terminé' }

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'