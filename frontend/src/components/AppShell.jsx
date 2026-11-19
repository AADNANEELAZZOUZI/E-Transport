// En-tête commun : identité + déconnexion. Le contenu arrive via children.
export default function AppShell({ user, onLogout, children }) {
  return (
    <div className="shell">
      <header className="topbar">
        <strong>FleetTrackPRO</strong>
        <span className="who">
          {user.nom} <span className="badge">{user.role === 'admin' ? 'Admin' : 'Chauffeur'}</span>
        </span>
        <button type="button" className="secondary" onClick={onLogout}>Déconnexion</button>
      </header>
      {children}
    </div>
  )
}