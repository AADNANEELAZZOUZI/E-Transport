import { useState } from 'react'
import * as api from './api.js'
import LoginForm from './components/LoginForm.jsx'
import AppShell from './components/AppShell.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import DriverLayout from './components/DriverLayout.jsx'
import ProtectedView from './components/ProtectedView.jsx'
import UsersPage from './components/UsersPage.jsx'
import TrucksPage from './components/TrucksPage.jsx'
import TripList from './components/TripList.jsx'

const EMPTY = { items: [], status: 'idle', error: '' } // status : idle | loading | ready | error

// App = parent commun : il possède la session, la vue active et les données partagées.
export default function App() {
  const [session, setSession] = useState(null) // { id, nom, email, role, statut } renvoyé par l'API
  const [view, setView] = useState('accueil')
  const [loginPending, setLoginPending] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [users, setUsers] = useState(EMPTY)
  const [camions, setCamions] = useState(EMPTY)
  const [trajets, setTrajets] = useState(EMPTY)

  function resetSession(message = '') {
    api.clearTokens()
    setSession(null)
    setView('accueil')
    setUsers(EMPTY)
    setCamions(EMPTY)
    setTrajets(EMPTY)
    setLoginError(message)
  }

  // Exécute un appel API et traduit le résultat : jamais de faux succès.
  //  401 -> session retirée (le renouvellement unique a déjà échoué dans api.js)
  //  403 -> session conservée, « Accès refusé »
  async function run(action) {
    try {
      return { ok: true, data: await action() }
    } catch (e) {
      if (e.status === 401) {
        resetSession('Session expirée. Veuillez vous reconnecter.')
        return { ok: false, expired: true, message: 'Session expirée.' }
      }
      if (e.status === 403) return { ok: false, message: `Accès refusé : ${e.message}` }
      const message = e.details ? `${e.message} (${e.details})` : e.message
      return { ok: false, message }
    }
  }

  async function load(setter, fetcher) {
    setter((prev) => ({ ...prev, status: 'loading', error: '' }))
    const result = await run(fetcher)
    if (result.ok) setter({ items: result.data, status: 'ready', error: '' })
    else if (!result.expired) setter((prev) => ({ ...prev, status: 'error', error: result.message }))
  }

  // ---------- Événements ----------
  async function handleLogin(email, motDePasse) {
    setLoginPending(true)
    setLoginError('')
    try {
      const user = await api.login(email, motDePasse)
      setSession(user)
      if (user.role === 'chauffeur') {
        setView('trajets')
        load(setTrajets, api.listMesTrajets)
      } else {
        setView('accueil')
      }
      return true
    } catch (e) {
      setLoginError(e.message) // 401 identifiants / 403 compte suspendu : message du serveur
      return false
    } finally {
      setLoginPending(false)
    }
  }

  async function handleLogout() {
    await api.logout() // appelle POST /auth/logout puis efface les jetons en mémoire
    resetSession()
  }

  function handleNavigate(next) {
    setView(next)
    if (next === 'users') load(setUsers, api.listChauffeurs)
    if (next === 'camions') load(setCamions, api.listCamions)
  }

  async function createChauffeur(values) {
    const result = await run(() => api.registerUser({ ...values, role: 'chauffeur' }))
    if (result.ok) await load(setUsers, api.listChauffeurs) // on relit la liste confirmée par le serveur
    return result
  }

  async function toggleUserStatus(user, suspend) {
    const result = await run(() => (suspend ? api.suspendChauffeur(user._id) : api.reactivateChauffeur(user._id)))
    if (result.ok) {
      const updated = result.data.chauffeur // version confirmée par le serveur
      setUsers((prev) => ({ ...prev, items: prev.items.map((u) => (u._id === updated._id ? updated : u)) }))
    }
    return result
  }

  async function createTruck(values) {
    const result = await run(() => api.createCamion(values))
    if (!result.ok) return result
    const truck = result.data.data
    setCamions((prev) => ({ ...prev, items: [truck, ...prev.items] }))
    return { ok: true, truck }
  }

  async function updateTruck(id, values) {
    const result = await run(() => api.updateCamion(id, values))
    if (!result.ok) return result
    const truck = result.data.data
    setCamions((prev) => ({ ...prev, items: prev.items.map((t) => (t._id === truck._id ? truck : t)) }))
    return { ok: true, truck }
  }

  async function archiveTruck(truck) {
    const result = await run(() => api.archiveCamion(truck._id))
    if (result.ok) setCamions((prev) => ({ ...prev, items: prev.items.filter((t) => t._id !== truck._id) }))
    return result
  }

  // ---------- Rendu ----------
  if (!session) return <LoginForm onLogin={handleLogin} pending={loginPending} error={loginError} />

  let layout
  if (session.role === 'admin') {
    layout = (
      <AdminLayout view={view} onNavigate={handleNavigate}>
        <ProtectedView session={session} allowedRoles={['admin']}>
          {view === 'accueil' && (
            <section>
              <h2>Bienvenue, {session.nom}</h2>
              <p className="muted">Utilisez le menu pour gérer les utilisateurs et les camions.</p>
            </section>
          )}
          {view === 'users' && (
            <UsersPage admin={session} users={users} onReload={() => load(setUsers, api.listChauffeurs)}
              onCreate={createChauffeur} onToggleStatus={toggleUserStatus} />
          )}
          {view === 'camions' && (
            <TrucksPage camions={camions} onReload={() => load(setCamions, api.listCamions)}
              onCreate={createTruck} onUpdate={updateTruck} onArchive={archiveTruck} />
          )}
        </ProtectedView>
      </AdminLayout>
    )
  } else {
    layout = (
      <DriverLayout user={session}>
        <ProtectedView session={session} allowedRoles={['chauffeur']}>
          <TripList trajets={trajets} onReload={() => load(setTrajets, api.listMesTrajets)} />
        </ProtectedView>
      </DriverLayout>
    )
  }

  return <AppShell user={session} onLogout={handleLogout}>{layout}</AppShell>
}