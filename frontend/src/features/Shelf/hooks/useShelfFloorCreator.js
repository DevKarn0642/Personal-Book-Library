import { useState } from 'react'
import { updateShelf } from '../services/shelfApi.js'
import { createShelfFloor, listShelfFloors } from '../services/shelfFloorApi.js'

const MAX_INTEGER = 2147483647

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useShelfFloorCreator() {
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [isMutating, setIsMutating] = useState(false)

  async function addShelfFloors(shelf, floors) {
    if (!shelf?.shelf_id || floors.length === 0) return null

    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const existingShelfFloors = await listShelfFloors(shelf.shelf_id)
      const existingFloorNumbers = new Set(
        existingShelfFloors.map((shelfFloor) => Number(shelfFloor.shelf_floor)),
      )

      if (floors.some(({ shelfFloor }) => existingFloorNumbers.has(shelfFloor))) {
        throw new Error('มีหมายเลขชั้นนี้อยู่แล้วในชั้นวาง')
      }

      const existingCapacity = existingShelfFloors.reduce(
        (total, shelfFloor) => total + Number(shelfFloor.shelf_floor_limit ?? 0),
        0,
      )
      const addedCapacity = floors.reduce(
        (total, shelfFloor) => total + Number(shelfFloor.shelfFloorLimit),
        0,
      )
      const shelfLimit = existingCapacity + addedCapacity

      if (shelfLimit > MAX_INTEGER) {
        throw new Error('จำนวนที่เก็บได้รวมต้องไม่เกิน 2,147,483,647')
      }

      for (const { shelfFloor, shelfFloorLimit } of floors) {
        await createShelfFloor(shelf.shelf_id, shelfFloor, shelfFloorLimit)
      }

      const updatedShelf = await updateShelf(
        shelf.shelf_id,
        shelf.shelf_name,
        shelfLimit,
        shelf.shelf_color,
        shelf.shelf_material,
      )
      setSuccessMessage(`เพิ่มชั้นย่อย ${floors.length} ชั้น และอัปเดตความจุรวมแล้ว`)
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
    addShelfFloors,
    clearError,
    clearSuccessMessage,
    error,
    isMutating,
    successMessage,
  }
}
