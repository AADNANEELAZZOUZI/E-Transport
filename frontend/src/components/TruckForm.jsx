import { useState } from 'react'
import Notice from './Notice.jsx'
import { STATUT_CAMION } from '../labels.js'

// Création ET modification : seules les valeurs initiales et le libellé changent.
export default function TruckForm({ initialValues, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)

  const change = (field) => (e) => setValues({ ...values, [field]: e.target.value })

  function validate() {
    const found = {}
    if (!values.immatriculation.trim()) found.immatriculation = 'Immatriculation requise.'
    if (!values.marque.trim()) found.marque = 'Marque requise.'
    if (!values.modele.trim()) found.modele = 'Modèle requis.'
    if (values.kmCumule !== '' && !(Number(values.kmCumule) >= 0)) found.kmCumule = 'Kilométrage : nombre positif.'
    return found
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    const payload = {
      immatriculation: values.immatriculation.trim(),
      marque: values.marque.trim(),
      modele: values.modele.trim(),
      statut: values.statut,
    }
    if (values.kmCumule !== '') payload.kmCumule = Number(values.kmCumule)

    setPending(true)
    const result = await onSubmit(payload)
    setPending(false)
    if (!result.ok) setFormError(result.message) // 400/403/409 : champs conservés, aucun succès affiché
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h3>{submitLabel === 'Créer' ? 'Nouveau camion' : 'Modifier le camion'}</h3>

      <label htmlFor="truck-immat">Immatriculation</label>
      <input id="truck-immat" value={values.immatriculation} onChange={change('immatriculation')} />
      <Notice>{errors.immatriculation}</Notice>

      <label htmlFor="truck-marque">Marque</label>
      <input id="truck-marque" value={values.marque} onChange={change('marque')} />
      <Notice>{errors.marque}</Notice>

      <label htmlFor="truck-modele">Modèle</label>
      <input id="truck-modele" value={values.modele} onChange={change('modele')} />
      <Notice>{errors.modele}</Notice>

      <label htmlFor="truck-km">Kilométrage cumulé (optionnel)</label>
      <input id="truck-km" type="number" min="0" value={values.kmCumule} onChange={change('kmCumule')} />
      <Notice>{errors.kmCumule}</Notice>

      <label htmlFor="truck-statut">Statut</label>
      <select id="truck-statut" value={values.statut} onChange={change('statut')}>
        {Object.entries(STATUT_CAMION).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <Notice>{formError}</Notice>
      <div className="actions">
        <button type="submit" disabled={pending}>{pending ? 'Envoi…' : submitLabel}</button>
        <button type="button" className="secondary" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}