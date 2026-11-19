import { useState } from 'react'
import UserList from './UserList.jsx'
import UserForm from './UserForm.jsx'
import Notice from './Notice.jsx'
import { STATUT_USER, formatDate } from '../labels.js'

const EMPTY_USER = { nom: '', email: '', motDePasse: '' }

// Parent commun de la liste, du détail et du formulaire : il possède filtre, sélection et message.
// Les données et les appels API viennent d'App (props + callbacks).
export default function UsersPage({ admin, users, onReload, onCreate, onToggleStatus }) {
  const [statusFilter, setStatusFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState({ type: 'success', text: '' })

  // Valeurs DÉRIVÉES : calculées au rendu, jamais stockées dans un state.
  const visible = users.items.filter(
    (u) =>
      (statusFilter === 'tous' || u.statut === statusFilter) &&
      `${u.nom} ${u.email}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const selected = users.items.find((u) => u._id === selectedId) || null
  const suspendedCount = users.items.filter((u) => u.statut === 'suspendu').length

  async function handleCreate(values) {
    const result = await onCreate(values)
    if (result.ok) {
      setNotice({ type: 'success', text: 'Chauffeur créé.' })
      setShowForm(false)
    }
    return result
  }

  async function handleToggle() {
    const suspend = selected.statut === 'actif'
    const result = await onToggleStatus(selected, suspend)
    setNotice(result.ok
      ? { type: 'success', text: suspend ? 'Compte suspendu.' : 'Compte réactivé.' }
      : { type: 'error', text: result.message })
  }

  return (
    <section>
      <h2>Utilisateurs</h2>
      <p className="muted">
        Connecté : {admin.nom} ({admin.email}) — rôle Admin. L'API ne fournit pas de liste des comptes Admin.
      </p>

      <div className="toolbar">
        <label htmlFor="user-search">Recherche</label>
        <input id="user-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label htmlFor="user-status">Statut</label>
        <select id="user-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="tous">Tous</option>
          <option value="actif">Actifs</option>
          <option value="suspendu">Suspendus</option>
        </select>
        <button type="button" onClick={() => { setShowForm(true); setSelectedId(null) }}>Nouveau chauffeur</button>
        <button type="button" className="secondary" onClick={onReload}>Actualiser</button>
      </div>

      <p className="muted">{visible.length} affiché(s) sur {users.items.length} — {suspendedCount} suspendu(s)</p>
      <Notice type={notice.type}>{notice.text}</Notice>

      <div className="two-cols">
        <div>
          {users.status === 'loading' && <p>Chargement…</p>}
          {users.status === 'error' && <Notice>{users.error}</Notice>}
          {users.status === 'ready' && (
            <UserList items={visible} selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); setShowForm(false); setNotice({ type: 'success', text: '' }) }} />
          )}
        </div>

        <aside>
          {showForm && <UserForm initialValues={EMPTY_USER} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
          {!showForm && selected && (
            <div className="card">
              <h3>{selected.nom}</h3>
              <dl>
                <dt>Email</dt><dd>{selected.email}</dd>
                <dt>Rôle</dt><dd>{selected.role === 'admin' ? 'Admin' : 'Chauffeur'}</dd>
                <dt>Statut</dt><dd>{STATUT_USER[selected.statut]}</dd>
                <dt>Créé le</dt><dd>{formatDate(selected.createdAt)}</dd>
              </dl>
              <button type="button" onClick={handleToggle}>
                {selected.statut === 'actif' ? 'Suspendre' : 'Réactiver'}
              </button>
            </div>
          )}
          {!showForm && !selected && <p className="muted">Sélectionnez un utilisateur.</p>}
        </aside>
      </div>
    </section>
  )
}