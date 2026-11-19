import { useState } from 'react'
import Notice from './Notice.jsx'

// Création d'un Chauffeur (l'API livrée n'expose aucune route de modification d'utilisateur).
export default function UserForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState(false)

  const change = (field) => (e) => setValues({ ...values, [field]: e.target.value })

  function validate() {
    const found = {}
    if (values.nom.trim().length < 2) found.nom = 'Nom requis (2 caractères minimum).'
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) found.email = 'Email invalide.'
    if (values.motDePasse.length < 8) found.motDePasse = 'Mot de passe : 8 caractères minimum.'
    return found
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return // la saisie est conservée

    setPending(true)
    const result = await onSubmit({ nom: values.nom.trim(), email: values.email.trim(), motDePasse: values.motDePasse })
    setPending(false)
    if (result.ok) setValues(initialValues) // succès : on vide (donc le mot de passe aussi)
    else setFormError(result.message) // refus : on garde tout ce qui a été saisi
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h3>Nouveau chauffeur</h3>

      <label htmlFor="user-nom">Nom</label>
      <input id="user-nom" value={values.nom} onChange={change('nom')} />
      <Notice>{errors.nom}</Notice>

      <label htmlFor="user-email">Email</label>
      <input id="user-email" type="email" value={values.email} onChange={change('email')} />
      <Notice>{errors.email}</Notice>

      <label htmlFor="user-pass">Mot de passe</label>
      <input id="user-pass" type="password" autoComplete="new-password" value={values.motDePasse}
        onChange={change('motDePasse')} />
      <Notice>{errors.motDePasse}</Notice>

      <Notice>{formError}</Notice>
      <div className="actions">
        <button type="submit" disabled={pending}>{pending ? 'Création…' : 'Créer'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Annuler</button>
      </div>
    </form>
  )
}