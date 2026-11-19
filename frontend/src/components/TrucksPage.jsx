import { useState } from 'react'
import TruckList from './TruckList.jsx'
import TruckForm from './TruckForm.jsx'
import Notice from './Notice.jsx'
import { STATUT_CAMION } from '../labels.js'

const EMPTY_TRUCK = { immatriculation: '', marque: '', modele: '', kmCumule: '', statut: 'disponible' }

// Parent commun liste / détail / formulaire : filtre, sélection, mode et message vivent ici.
export default function TrucksPage({ camions, onReload, onCreate, onUpdate, onArchive }) {
  const [statusFilter, setStatusFilter] = useState('tous')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [mode, setMode] = useState('detail') // 'detail' | 'create' | 'edit'
  const [notice, setNotice] = useState({ type: 'success', text: '' })

  const visible = camions.items.filter(
    (t) =>
      (statusFilter === 'tous' || t.statut === statusFilter) &&
      t.immatriculation.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const selected = camions.items.find((t) => t._id === selectedId) || null
  const count = (statut) => camions.items.filter((t) => t.statut === statut).length

  async function handleCreate(values) {
    const result = await onCreate(values)
    if (result.ok) {
      setNotice({ type: 'success', text: 'Camion créé.' })
      setSelectedId(result.truck._id)
      setMode('detail')
    }
    return result
  }

  async function handleUpdate(values) {
    const result = await onUpdate(selected._id, values)
    if (result.ok) {
      setNotice({ type: 'success', text: 'Camion modifié.' })
      setMode('detail')
    }
    return result
  }

  async function handleArchive() {
    if (!window.confirm(`Archiver le camion ${selected.immatriculation} ?`)) return
    const result = await onArchive(selected)
    if (result.ok) {
      setNotice({ type: 'success', text: 'Camion archivé.' })
      setSelectedId(null)
    } else {
      setNotice({ type: 'error', text: result.message })
    }
  }

  const select = (id) => { setSelectedId(id); setMode('detail'); setNotice({ type: 'success', text: '' }) }

  return (
    <section>
      <h2>Camions</h2>
      <div className="toolbar">
        <label htmlFor="truck-search">Immatriculation</label>
        <input id="truck-search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <label htmlFor="truck-filter">Statut</label>
        <select id="truck-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="tous">Tous</option>
          {Object.entries(STATUT_CAMION).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={() => { setMode('create'); setSelectedId(null) }}>Nouveau camion</button>
        <button type="button" className="secondary" onClick={onReload}>Actualiser</button>
      </div>

      <p className="muted">
        {visible.length} affiché(s) sur {camions.items.length} — {count('disponible')} disponible(s),{' '}
        {count('maintenance')} en maintenance, {count('en_trajet')} en trajet
      </p>
      <Notice type={notice.type}>{notice.text}</Notice>

      <div className="two-cols">
        <div>
          {camions.status === 'loading' && <p>Chargement…</p>}
          {camions.status === 'error' && <Notice>{camions.error}</Notice>}
          {camions.status === 'ready' && <TruckList items={visible} selectedId={selectedId} onSelect={select} />}
        </div>

        <aside>
          {mode === 'create' && (
            <TruckForm initialValues={EMPTY_TRUCK} submitLabel="Créer" onSubmit={handleCreate}
              onCancel={() => setMode('detail')} />
          )}
          {mode === 'edit' && selected && (
            <TruckForm key={selected._id} submitLabel="Enregistrer" onSubmit={handleUpdate} onCancel={() => setMode('detail')}
              initialValues={{
                immatriculation: selected.immatriculation, marque: selected.marque, modele: selected.modele,
                kmCumule: String(selected.kmCumule ?? ''), statut: selected.statut,
              }} />
          )}
          {mode === 'detail' && selected && (
            <div className="card">
              <h3>{selected.immatriculation}</h3>
              <dl>
                <dt>Marque / modèle</dt><dd>{selected.marque} {selected.modele}</dd>
                <dt>Statut</dt><dd>{STATUT_CAMION[selected.statut]}</dd>
                <dt>Kilométrage</dt><dd>{selected.kmCumule} km</dd>
              </dl>
              <div className="actions">
                <button type="button" onClick={() => setMode('edit')}>Modifier</button>
                <button type="button" className="danger" onClick={handleArchive}>Archiver</button>
              </div>
            </div>
          )}
          {mode === 'detail' && !selected && <p className="muted">Sélectionnez un camion.</p>}
        </aside>
      </div>
    </section>
  )
}