import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

export async function listAuthors() {
  const response = await apiRequest('/api/authors?page=1&pageSize=100')
  const body = await readResponse(response, 'ไม่สามารถโหลดรายชื่อผู้เขียนได้')

  return body.authors
}

export async function createAuthor(authorName, authorPenName) {
  const response = await apiRequest('/api/authors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author_name: authorName,
      author_pen_name: authorPenName || null,
    }),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มผู้เขียนได้')

  return body.author
}

export async function updateAuthor(authorId, authorName, authorPenName) {
  const response = await apiRequest(`/api/authors/${authorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author_name: authorName,
      author_pen_name: authorPenName || null,
    }),
  })
  const body = await readResponse(response, 'ไม่สามารถแก้ไขผู้เขียนได้')

  return body.author
}

export async function deleteAuthor(authorId) {
  const response = await apiRequest(`/api/authors/${authorId}`, {
    method: 'DELETE',
  })
  const body = await readResponse(response, 'ไม่สามารถลบผู้เขียนได้')

  return body.success
}
