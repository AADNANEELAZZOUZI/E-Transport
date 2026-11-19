const ITEMS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'camions', label: 'Camions' },
]

// Menu Admin : la vue active vient du parent, le clic remonte via onNavigate.
export default function AdminLayout({ view, onNavigate, children }) {
  return (
    <div className="layout">
      <nav className="menu" aria-label="Navigation Admin">
        {ITEMS.map((item) => (
          <button key={item.id} type="button" className={view === item.id ? 'menu-item active' : 'menu-item'}
            aria-current={view === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}