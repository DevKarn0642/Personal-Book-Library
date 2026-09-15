import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

function toShelfFloorPayload(shelfFloor, shelfFloorLimit, bookId, categoryId) {
  return {
    shelf_floor: shelfFloor,
    shelf_floor_limit: shelfFloorLimit,
    book_id: bookId,
    category_id: categoryId,
  }
}

export async function listShelfFloors(shelfId) {
  const shelfFloors = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await apiRequest(`/api/shelves/${shelfId}/floors?page=${page}&pageSize=100`)
    const body = await readResponse(response, 'ไม่สามารถโหลดรายการชั้นย่อยได้')
    shelfFloors.push(...body.shelfFloors)
    totalPages = body.pagination?.totalPages || 1
    page += 1
  }

  return shelfFloors
}

export async function createShelfFloor(shelfId, shelfFloor, shelfFloorLimit) {
  const response = await apiRequest(`/api/shelves/${shelfId}/floors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toShelfFloorPayload(shelfFloor, shelfFloorLimit, null, null)),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มชั้นย่อยได้')

  return body.shelfFloor
}

export async function updateShelfFloor(
  shelfId,
  shelfFloorId,
  shelfFloor,
  shelfFloorLimit,
  bookId,
  categoryId,
) {
  const response = await apiRequest(`/api/shelves/${shelfId}/floors/${shelfFloorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toShelfFloorPayload(shelfFloor, shelfFloorLimit, bookId, categoryId)),
  })
  const body = await readResponse(response, 'ไม่สามารถแก้ไขชั้นย่อยได้')

  return body.shelfFloor
}

export async function deleteShelfFloor(shelfId, shelfFloorId) {
  const response = await apiRequest(`/api/shelves/${shelfId}/floors/${shelfFloorId}`, {
    method: 'DELETE',
  })
  const body = await readResponse(response, 'ไม่สามารถลบชั้นย่อยได้')

  return body.success
}
