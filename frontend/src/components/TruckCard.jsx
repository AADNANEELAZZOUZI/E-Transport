import { STATUT_CAMION } from '../labels.js'

export default function TruckCard({ truck, selected, onSelect }) {
  return (
    <li>
      <button type="button" className={selected ? 'row selected' : 'row'} aria-pressed={selected}
        onClick={() => onSelect(truck._id)}>
        <span><strong>{truck.immatriculation}</strong><br /><small>{truck.marque} {truck.modele}</small></span>
        <span className={`badge badge-${truck.statut}`}>{STATUT_CAMION[truck.statut] || truck.statut}</span>
      </button>
    </li>
  )
}