import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

function toHistoryPayload({ bookId, historyPage, historyStatus }) {
  return {
    book_id: bookId,
    history_page: historyPage,
    history_status: historyStatus?.trim() || null,
  }
}

export async function listHistories({ page = 1, pageSize = 10 } = {}) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  const response = await apiRequest(`/api/histories?${query}`)
  const body = await readResponse(response, 'ไม่สามารถโหลดประวัติการอ่านได้')

  return { histories: body.histories, pagination: body.pagination }
}

export async function listHistoryBooks() {
  async function fetchBookPage(page) {
    const response = await apiRequest(`/api/books?page=${page}&pageSize=100`)
    return readResponse(response, 'ไม่สามารถโหลดรายการหนังสือได้')
  }

  const firstPage = await fetchBookPage(1)
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, firstPage.pagination.totalPages - 1) },
    (_, index) => index + 2,
  )
  const remainingPages = await Promise.all(remainingPageNumbers.map(fetchBookPage))

  return [
    ...firstPage.books,
    ...remainingPages.flatMap((page) => page.books),
  ]
}

export async function createHistory(historyInput) {
  const response = await apiRequest('/api/histories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toHistoryPayload(historyInput)),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มประวัติการอ่านได้')
  return body.history
}

export async function updateHistory(historyId, historyInput) {
  const response = await apiRequest(`/api/histories/${historyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toHistoryPayload(historyInput)),
  })
  const body = await readResponse(response, 'ไม่สามารถบันทึกการแก้ไขประวัติการอ่านได้')
  return body.history
}

export async function deleteHistory(historyId) {
  const response = await apiRequest(`/api/histories/${historyId}`, { method: 'DELETE' })
  const body = await readResponse(response, 'ไม่สามารถลบประวัติการอ่านได้')
  return body.success
}
