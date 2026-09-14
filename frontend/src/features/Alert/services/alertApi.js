import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

function toAlertPayload({ alertRepeatType, alertDate, alertStatus, alertTime, bookId }) {
  return {
    alert_repeat_type: alertRepeatType?.trim() || null,
    alert_date: alertDate || null,
    alert_status: alertStatus,
    alert_time: alertTime || null,
    book_id: bookId?.trim() || null,
  }
}

export async function listAlerts({ page = 1, pageSize = 10 } = {}) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  const response = await apiRequest(`/api/alerts?${query}`)
  const body = await readResponse(response, 'ไม่สามารถโหลดรายการแจ้งเตือนได้')

  return { alerts: body.alerts, pagination: body.pagination }
}

export async function listAlertBooks() {
  const response = await apiRequest('/api/alerts/books')
  const body = await readResponse(response, 'ไม่สามารถโหลดรายการหนังสือได้')

  return body.books
}

export async function createAlert(alertInput) {
  const response = await apiRequest('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toAlertPayload(alertInput)),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มการแจ้งเตือนได้')

  return body.alert
}

export async function updateAlert(alertId, alertInput) {
  const response = await apiRequest(`/api/alerts/${alertId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toAlertPayload(alertInput)),
  })
  const body = await readResponse(response, 'ไม่สามารถแก้ไขการแจ้งเตือนได้')

  return body.alert
}

export async function deleteAlert(alertId) {
  const response = await apiRequest(`/api/alerts/${alertId}`, { method: 'DELETE' })
  const body = await readResponse(response, 'ไม่สามารถลบการแจ้งเตือนได้')

  return body.success
}
