import { STATUT_USER } from '../labels.js'

export default function UserCard({ user, selected, onSelect }) {
  return (
    <li>
      <button type="button" className={selected ? 'row selected' : 'row'} aria-pressed={selected}
        onClick={() => onSelect(user._id)}>
        <span><strong>{user.nom}</strong><br /><small>{user.email}</small></span>
        <span className={`badge badge-${user.statut}`}>{STATUT_USER[user.statut] || user.statut}</span>
      </button>
    </li>
  )
}