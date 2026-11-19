// Module api : seul endroit qui connaît la base URL et les routes HTTP.
// Les jetons restent en MÉMOIRE (variables de module) : ni localStorage, ni URL, ni log.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

let accessToken = null
let refreshToken = null
let refreshing = null // évite deux renouvellements simultanés (le refresh token est à usage unique)

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status // 0 = serveur injoignable
    this.details = details
  }
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  refreshing = null
}

async function send(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, "Serveur injoignable. Vérifiez que l'API est démarrée.")
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // corps vide ou non JSON
  }
  if (!res.ok) throw new ApiError(res.status, data?.message || `Erreur ${res.status}`, data?.details)
  return data
}

function renewTokens() {
  if (!refreshToken) return Promise.reject(new ApiError(401, 'Session expirée. Reconnectez-vous.'))
  if (!refreshing) {
    refreshing = send('/auth/refresh', { method: 'POST', body: { refreshToken } })
      .then((t) => {
        accessToken = t.accessToken
        refreshToken = t.refreshToken // rotation : l'ancien refresh token est invalidé
      })
      .catch(() => {
        throw new ApiError(401, 'Session expirée. Reconnectez-vous.')
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

// Appel protégé : sur 401, UNE seule tentative de renouvellement, puis un seul rejeu.
async function authed(path, options = {}) {
  try {
    return await send(path, { ...options, token: accessToken })
  } catch (e) {
    if (e.status !== 401 || !refreshToken) throw e
    await renewTokens()
    return send(path, { ...options, token: accessToken })
  }
}

// ---------- Authentification ----------
export async function login(email, motDePasse) {
  const data = await send('/auth/login', { method: 'POST', body: { email, motDePasse } })
  accessToken = data.accessToken
  refreshToken = data.refreshToken
  return data.user // { id, nom, email, role, statut } : identité et rôle viennent du serveur
}

export async function logout() {
  try {
    if (accessToken) await authed('/auth/logout', { method: 'POST' })
  } catch {
    // même si le serveur échoue, on efface la session locale
  } finally {
    clearTokens()
  }
}

// ---------- Utilisateurs (Admin) ----------
export const listChauffeurs = () => authed('/chauffeurs')
export const suspendChauffeur = (id) => authed(`/chauffeurs/${id}/suspendre`, { method: 'PATCH' })
export const reactivateChauffeur = (id) => authed(`/chauffeurs/${id}/reactiver`, { method: 'PATCH' })
export const registerUser = (values) => authed('/auth/register', { method: 'POST', body: values })

// ---------- Camions (Admin) ----------
export const listCamions = () => authed('/camions')
export const createCamion = (values) => authed('/camions', { method: 'POST', body: values })
export const updateCamion = (id, values) => authed(`/camions/${id}`, { method: 'PUT', body: values })
export const archiveCamion = (id) => authed(`/camions/${id}`, { method: 'DELETE' })

// ---------- Chauffeur ----------
// Le serveur filtre déjà : un chauffeur ne reçoit QUE ses trajets.
export const listMesTrajets = () => authed('/trajets')