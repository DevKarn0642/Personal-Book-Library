const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function apiRequest(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...options })
}
