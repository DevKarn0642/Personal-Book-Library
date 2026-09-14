import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

function toBookFormData(bookInput) {
  const formData = new FormData()

  formData.append('book_name', bookInput.bookName.trim())
  formData.append('book_type', bookInput.bookType)

  if (bookInput.categoryId) formData.append('category_id', bookInput.categoryId)
  if (bookInput.authorId) formData.append('author_id', bookInput.authorId)
  if (bookInput.bookDate) formData.append('book_date', bookInput.bookDate)
  if (bookInput.bookTotalPage !== null && bookInput.bookTotalPage !== undefined) {
    formData.append('book_totalpage', String(bookInput.bookTotalPage))
  }

  if (bookInput.bookType === 'file') {
    if (bookInput.bookFile) {
      formData.append('book_file', bookInput.bookFile)
    } else if (bookInput.existingBookFile) {
      formData.append('book_file', bookInput.existingBookFile)
    }
  }

  if (bookInput.bookCoverImage) {
    formData.append('book_cover_image', bookInput.bookCoverImage)
  } else if (bookInput.existingBookCoverImage) {
    formData.append('book_cover_image', bookInput.existingBookCoverImage)
  }

  return formData
}

export async function listBooks({ page = 1, pageSize = 10 } = {}) {
  const response = await apiRequest(`/api/books?page=${page}&pageSize=${pageSize}`)
  return readResponse(response, 'ไม่สามารถโหลดรายการหนังสือได้')
}

export async function listBookCategories() {
  const response = await apiRequest('/api/categories?page=1&pageSize=100')
  const body = await readResponse(response, 'ไม่สามารถโหลดหมวดหมู่หนังสือได้')
  return body.categories
}

export async function listBookAuthors() {
  const response = await apiRequest('/api/authors?page=1&pageSize=100')
  const body = await readResponse(response, 'ไม่สามารถโหลดรายชื่อผู้เขียนได้')
  return body.authors
}

export async function createBook(bookInput) {
  const response = await apiRequest('/api/books', {
    method: 'POST',
    body: toBookFormData(bookInput),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มหนังสือได้')
  return body.book
}

export async function updateBook(bookId, bookInput) {
  const response = await apiRequest(`/api/books/${bookId}`, {
    method: 'PUT',
    body: toBookFormData(bookInput),
  })
  const body = await readResponse(response, 'ไม่สามารถบันทึกการแก้ไขหนังสือได้')
  return body.book
}

export async function deleteBook(bookId) {
  const response = await apiRequest(`/api/books/${bookId}`, { method: 'DELETE' })
  const body = await readResponse(response, 'ไม่สามารถลบหนังสือได้')
  return body.success
}
