// Protection d'AFFICHAGE uniquement : le backend reste seul responsable de l'autorisation.
export default function ProtectedView({ session, allowedRoles, children }) {
  if (!session) return <p className="notice notice-error" role="alert">Connexion requise.</p>
  if (!allowedRoles.includes(session.role)) {
    return <p className="notice notice-error" role="alert">Accès refusé.</p>
  }
  return children
}