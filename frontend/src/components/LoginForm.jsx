import { useState } from 'react'
import Notice from './Notice.jsx'

// Champs contrôlés : le state local est la source de vérité des inputs.
// Le parent fournit onLogin (callback), pending (attente) et error (retour API).
export default function LoginForm({ onLogin, pending, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim() || !password) {
      setFieldError("Renseignez l'email et le mot de passe.")
      return
    }
    setFieldError('')
    const ok = await onLogin(email.trim(), password)
    if (ok) setPassword('') // on efface le mot de passe après succès
  }

  return (
    <main className="login">
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h1>FleetTrackPRO</h1>
        <p className="muted">Connexion</p>

        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" autoComplete="username" value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="login-password">Mot de passe</label>
        <input id="login-password" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <Notice>{fieldError || error}</Notice>
        <button type="submit" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
      </form>
    </main>
  )
}