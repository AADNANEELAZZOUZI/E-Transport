import TruckCard from './TruckCard.jsx'

export default function TruckList({ items, selectedId, onSelect }) {
  if (items.length === 0) return <p className="muted">Aucun camion à afficher.</p>
  return (
    <ul className="list">
      {items.map((truck) => (
        <TruckCard key={truck._id} truck={truck} selected={truck._id === selectedId} onSelect={onSelect} />
      ))}
    </ul>
  )
}