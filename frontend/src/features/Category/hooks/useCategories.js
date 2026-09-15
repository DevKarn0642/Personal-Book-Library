import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../services/categoryApi.js'

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await listCategories()
      setCategories(result)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function addCategory(categoryName) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const category = await createCategory(categoryName)
      setCategories((currentCategories) => [...currentCategories, category])
      setSuccessMessage('เพิ่มหมวดหมู่แล้ว')
      return category
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editCategory(categoryId, categoryName) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updatedCategory = await updateCategory(categoryId, categoryName)

      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.category_id === updatedCategory.category_id
            ? updatedCategory
            : category,
        ),
      )

      setSuccessMessage('บันทึกการแก้ไขหมวดหมู่แล้ว')
      return updatedCategory
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeCategory(categoryId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteCategory(categoryId)

      if (success) {
        setCategories((currentCategories) =>
          currentCategories.filter(
            (category) => String(category.category_id) !== String(categoryId),
          ),
        )
        setSuccessMessage('ลบหมวดหมู่แล้ว')
      }

      return success
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return false
    } finally {
      setIsMutating(false)
    }
  }

  function clearError() {
    setError(null)
  }

  function clearSuccessMessage() {
    setSuccessMessage(null)
  }

  return {
    addCategory,
    categories,
    clearError,
    clearSuccessMessage,
    editCategory,
    error,
    isLoading,
    isMutating,
    loadCategories,
    removeCategory,
    successMessage,
  }
}
