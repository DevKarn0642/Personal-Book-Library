import { useState } from 'react'
import { updateShelf } from '../services/shelfApi.js'
import {
  createShelfFloor,
  deleteShelfFloor,
  listShelfFloorCategories,
  listShelfFloors,
  updateShelfFloor,
} from '../services/shelfFloorApi.js'

const MAX_INTEGER = 2147483647

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useShelfFloorCreator() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  async function loadShelfFloors(shelfId) {
    setIsLoading(true)
    setError(null)

    try {
      const [shelfFloors, loadedCategories] = await Promise.all([
        listShelfFloors(shelfId),
        listShelfFloorCategories(),
      ])
      setCategories(loadedCategories)
      return shelfFloors
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function saveShelfFloors(shelf, floors) {
    if (!shelf?.shelf_id || floors.length === 0) return null

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const existingShelfFloors = await listShelfFloors(shelf.shelf_id)
      const submittedFloorNumbers = new Set()
      const hasDuplicateFloorNumber = floors.some(({ shelfFloor }) => {
        if (submittedFloorNumbers.has(shelfFloor)) return true

        submittedFloorNumbers.add(shelfFloor)
        return false
      })

      if (hasDuplicateFloorNumber) {
        throw new Error('หมายเลขชั้นต้องไม่ซ้ำกัน')
      }

      const shelfLimit = floors.reduce(
        (total, shelfFloor) => total + Number(shelfFloor.shelfFloorLimit),
        0,
      )

      if (shelfLimit > MAX_INTEGER) {
        throw new Error('จำนวนที่เก็บได้รวมต้องไม่เกิน 2,147,483,647')
      }

      const existingFloorsById = new Map(
        existingShelfFloors.map((shelfFloor) => [String(shelfFloor.shelf_floor_id), shelfFloor]),
      )
      const submittedExistingFloorIds = new Set()

      for (const { categoryId, shelfFloorId, shelfFloor, shelfFloorLimit } of floors) {
        if (!shelfFloorId) {
          await createShelfFloor(shelf.shelf_id, shelfFloor, shelfFloorLimit, categoryId)
          continue
        }

        const existingShelfFloor = existingFloorsById.get(String(shelfFloorId))
        if (!existingShelfFloor) {
          throw new Error('ไม่พบชั้นย่อยที่ต้องการแก้ไข')
        }

        submittedExistingFloorIds.add(String(shelfFloorId))
        await updateShelfFloor(
          shelf.shelf_id,
          shelfFloorId,
          shelfFloor,
          shelfFloorLimit,
          categoryId ?? null,
        )
      }

      for (const existingShelfFloor of existingShelfFloors) {
        if (!submittedExistingFloorIds.has(String(existingShelfFloor.shelf_floor_id))) {
          await deleteShelfFloor(shelf.shelf_id, existingShelfFloor.shelf_floor_id)
        }
      }

      const updatedShelf = await updateShelf(
        shelf.shelf_id,
        shelf.shelf_name,
        shelfLimit,
        shelf.shelf_color,
        shelf.shelf_material,
      )
      setSuccessMessage('บันทึกชั้นย่อยและอัปเดตความจุรวมแล้ว')
      return updatedShelf
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
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
    categories,
    clearError,
    clearSuccessMessage,
    error,
    isLoading,
    isMutating,
    loadShelfFloors,
    saveShelfFloors,
    successMessage,
  }
}
