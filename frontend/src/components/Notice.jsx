// Message proche de l'action. Erreur = role="alert", succès = role="status".
export default function Notice({ type = 'error', children }) {
  if (!children) return null
  return (
    <p className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}