import { useCallback, useEffect, useState } from 'react'
import {
  createShelf,
  deleteShelf,
  listShelves,
  updateShelf,
} from '../services/shelfApi.js'

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useShelves() {
  const [shelves, setShelves] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)

  const loadShelves = useCallback(async () => {
    try {
      const result = await listShelves()
      setShelves(result)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShelves()
  }, [loadShelves])

  async function addShelf(shelfName, shelfLimit, shelfColor, shelfMaterial) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const shelf = await createShelf(shelfName, shelfLimit, shelfColor, shelfMaterial)
      setShelves((currentShelves) => [...currentShelves, shelf])
      setSuccessMessage('บันทึกชั้นวางเรียบร้อยแล้ว')
      return shelf
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editShelf(shelfId, shelfName, shelfLimit, shelfColor, shelfMaterial) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updatedShelf = await updateShelf(
        shelfId,
        shelfName,
        shelfLimit,
        shelfColor,
        shelfMaterial,
      )
      setShelves((currentShelves) =>
        currentShelves.map((shelf) =>
          String(shelf.shelf_id) === String(updatedShelf.shelf_id)
            ? updatedShelf
            : shelf,
        ),
      )
      setSuccessMessage('บันทึกการแก้ไขชั้นวางเรียบร้อยแล้ว')
      return updatedShelf
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeShelf(shelfId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteShelf(shelfId)

      if (success) {
        setShelves((currentShelves) =>
          currentShelves.filter((shelf) => String(shelf.shelf_id) !== String(shelfId)),
        )
        setSuccessMessage('ลบชั้นวางเรียบร้อยแล้ว')
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
    addShelf,
    clearError,
    clearSuccessMessage,
    editShelf,
    error,
    isLoading,
    isMutating,
    removeShelf,
    shelves,
    successMessage,
  }
}
