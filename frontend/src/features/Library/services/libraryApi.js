import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

export async function listLibraryBooks({
  authorId,
  bookType,
  categoryId,
  page = 1,
  pageSize = 12,
  search,
  shelfId,
} = {}) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })

  if (bookType) query.set('bookType', bookType)
  if (categoryId) query.set('categoryId', categoryId)
  if (authorId) query.set('authorId', authorId)
  if (shelfId) query.set('shelfId', shelfId)
  if (search?.trim()) query.set('search', search.trim())

  const response = await apiRequest(`/api/books?${query.toString()}`)
  return readResponse(response, 'ไม่สามารถโหลดรายการหนังสือได้')
}

export async function getLibraryBook(bookId) {
  const response = await apiRequest(`/api/books/${bookId}`)
  const body = await readResponse(response, 'ไม่สามารถโหลดรายละเอียดหนังสือได้')
  return body.book
}

export async function listLibraryReferenceData() {
  const [categoriesResponse, authorsResponse, shelvesResponse] = await Promise.all([
    apiRequest('/api/categories?page=1&pageSize=100'),
    apiRequest('/api/authors?page=1&pageSize=100'),
    apiRequest('/api/shelves?page=1&pageSize=100'),
  ])

  const [categories, authors, shelves] = await Promise.all([
    readResponse(categoriesResponse, 'ไม่สามารถโหลดหมวดหมู่หนังสือได้'),
    readResponse(authorsResponse, 'ไม่สามารถโหลดรายชื่อผู้เขียนได้'),
    readResponse(shelvesResponse, 'ไม่สามารถโหลดรายการชั้นวางได้'),
  ])

  return {
    authors: authors.authors,
    categories: categories.categories,
    shelves: shelves.shelves,
  }
}
