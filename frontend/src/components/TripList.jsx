import Notice from './Notice.jsx'
import { STATUT_TRAJET, formatDate } from '../labels.js'

// Affiche uniquement la réponse de GET /api/trajets (le serveur ne renvoie que les trajets du chauffeur).
export default function TripList({ trajets, onReload }) {
  return (
    <section>
      <h2>Mes trajets</h2>
      <button type="button" className="secondary" onClick={onReload}>Actualiser</button>
      {trajets.status === 'loading' && <p>Chargement…</p>}
      {trajets.status === 'error' && <Notice>{trajets.error}</Notice>}
      {trajets.status === 'ready' && trajets.items.length === 0 && <p className="muted">Aucun trajet pour le moment.</p>}
      <ul className="list">
        {trajets.items.map((t) => (
          <li key={t._id} className="card">
            <strong>{t.siteDepart} → {t.siteArrivee}</strong>
            <span className="badge">{STATUT_TRAJET[t.statut] || t.statut}</span>
            <p className="muted">
              {t.marchandise} — {formatDate(t.dateDebutPrevue)} → {formatDate(t.dateFinPrevue)}
              {t.camion?.immatriculation ? ` — camion ${t.camion.immatriculation}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}