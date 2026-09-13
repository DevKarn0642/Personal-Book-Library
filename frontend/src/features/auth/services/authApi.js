import { apiRequest } from '../../../services/api.js'

export async function login({ identifier, password }) {
  const trimmedIdentifier = identifier.trim()
  const credentials = trimmedIdentifier.includes('@')
    ? { email: trimmedIdentifier, password }
    : { username: trimmedIdentifier, password }

  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || 'ไม่สามารถเข้าสู่ระบบได้')
  }

  return body
}
