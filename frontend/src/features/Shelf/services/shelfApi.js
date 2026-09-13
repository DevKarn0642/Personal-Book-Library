import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

function toShelfPayload(shelfName, shelfLimit, shelfColor, shelfMaterial) {
  return {
    shelf_name: shelfName,
    shelf_limit: shelfLimit,
    shelf_color: shelfColor,
    shelf_material: shelfMaterial,
  }
}

export async function listShelves() {
  const response = await apiRequest('/api/shelves?page=1&pageSize=100')
  const body = await readResponse(response, 'ไม่สามารถโหลดรายการชั้นวางได้')

  return body.shelves
}

export async function createShelf(shelfName, shelfLimit, shelfColor, shelfMaterial) {
  const response = await apiRequest('/api/shelves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toShelfPayload(shelfName, shelfLimit, shelfColor, shelfMaterial)),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มชั้นวางได้')

  return body.shelf
}

export async function updateShelf(shelfId, shelfName, shelfLimit, shelfColor, shelfMaterial) {
  const response = await apiRequest(`/api/shelves/${shelfId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toShelfPayload(shelfName, shelfLimit, shelfColor, shelfMaterial)),
  })
  const body = await readResponse(response, 'ไม่สามารถแก้ไขชั้นวางได้')

  return body.shelf
}

export async function deleteShelf(shelfId) {
  const response = await apiRequest(`/api/shelves/${shelfId}`, {
    method: 'DELETE',
  })
  const body = await readResponse(response, 'ไม่สามารถลบชั้นวางได้')

  return body.success
}
