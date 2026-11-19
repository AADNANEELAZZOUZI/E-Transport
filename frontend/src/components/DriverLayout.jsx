// Layout Chauffeur : identité + une seule entrée « Mes trajets ».
export default function DriverLayout({ user, children }) {
  return (
    <div className="layout">
      <nav className="menu" aria-label="Navigation Chauffeur">
        <p className="muted">{user.email}</p>
        <button type="button" className="menu-item active" aria-current="page">Mes trajets</button>
      </nav>
      <main className="content">{children}</main>
    </div>
  )
}