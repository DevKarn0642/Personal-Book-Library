import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

export async function listBooksForArrangement({
  authorId,
  bookType,
  categoryId,
  page = 1,
  pageSize = 10,
  search,
  shelfStatus = 'all',
} = {}) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), shelfStatus })

  if (authorId) query.set('authorId', authorId)
  if (bookType) query.set('bookType', bookType)
  if (categoryId) query.set('categoryId', categoryId)
  if (search) query.set('search', search)

  const response = await apiRequest(`/api/book-arrangements/books?${query.toString()}`)
  return readResponse(response, 'ไม่สามารถโหลดรายการหนังสือได้')
}

export async function listBookArrangementReferenceData() {
  const response = await apiRequest('/api/book-arrangements/reference-data')
  return readResponse(response, 'ไม่สามารถโหลดข้อมูลตัวกรองได้')
}

export async function listBookArrangementShelves() {
  const response = await apiRequest('/api/book-arrangements/shelves')
  const body = await readResponse(response, 'ไม่สามารถโหลดรายการชั้นวางได้')
  return body.shelves
}

export async function assignBookToShelfFloor(bookId, shelfFloorId) {
  const response = await apiRequest('/api/book-arrangements/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: bookId, shelf_floor_id: shelfFloorId }),
  })
  const body = await readResponse(response, 'ไม่สามารถบันทึกชั้นวางได้')
  return body.assignment
}
