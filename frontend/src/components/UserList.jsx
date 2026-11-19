import UserCard from './UserCard.jsx'

// Liste pure : reçoit des éléments déjà filtrés, la sélection et un callback. Clé stable = _id.
export default function UserList({ items, selectedId, onSelect }) {
  if (items.length === 0) return <p className="muted">Aucun utilisateur à afficher.</p>
  return (
    <ul className="list">
      {items.map((user) => (
        <UserCard key={user._id} user={user} selected={user._id === selectedId} onSelect={onSelect} />
      ))}
    </ul>
  )
}