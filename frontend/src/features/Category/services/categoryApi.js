import { apiRequest } from '../../../services/api.js'

async function readResponse(response, fallbackMessage) {
  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(body.message || fallbackMessage)
  }

  return body
}

export async function listCategories() {
  const response = await apiRequest('/api/categories')
  const body = await readResponse(response, 'ไม่สามารถโหลดหมวดหมู่ได้')

  return body.categories
}

export async function createCategory(categoryName) {
  const response = await apiRequest('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_name: categoryName }),
  })
  const body = await readResponse(response, 'ไม่สามารถเพิ่มหมวดหมู่ได้')

  return body.category
}

export async function getCategoryById(categoryId) {
  const response = await apiRequest(`/api/categories/${categoryId}`)
  const body = await readResponse(response, 'ไม่พบหมวดหมู่')

  return body.category
}

export async function updateCategory(categoryId, categoryName) {
  const response = await apiRequest(`/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category_name: categoryName }),
  })
  const body = await readResponse(response, 'ไม่สามารถแก้ไขหมวดหมู่ได้')

  return body.category
}

export async function deleteCategory(categoryId) {
  const response = await apiRequest(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  })
  const body = await readResponse(response, 'ไม่สามารถลบหมวดหมู่ได้')

  return body.success
}