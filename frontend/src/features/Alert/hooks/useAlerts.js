import { useCallback, useEffect, useState } from 'react'
import {
  createAlert,
  deleteAlert,
  listAlertBooks,
  listAlerts,
  updateAlert,
} from '../services/alertApi.js'

const initialPagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [bookOptions, setBookOptions] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBookOptionsLoading, setIsBookOptionsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [pagination, setPagination] = useState(initialPagination)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadAlerts = useCallback(async ({ page = 1, pageSize = 10 } = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await listAlerts({ page, pageSize })
      setAlerts(result.alerts)
      setPagination(result.pagination)
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialAlerts() {
      try {
        const [result, books] = await Promise.all([listAlerts(), listAlertBooks()])
        if (isMounted) {
          setAlerts(result.alerts)
          setBookOptions(books)
          setPagination(result.pagination)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsBookOptionsLoading(false)
        }
      }
    }

    loadInitialAlerts()

    return () => {
      isMounted = false
    }
  }, [])

  async function addAlert(alertInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const alert = await createAlert(alertInput)
      await loadAlerts({ page: 1, pageSize: pagination.pageSize })
      setSuccessMessage('เพิ่มการแจ้งเตือนแล้ว')
      return alert
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editAlert(alertId, alertInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const alert = await updateAlert(alertId, alertInput)
      await loadAlerts({ page: pagination.page, pageSize: pagination.pageSize })
      setSuccessMessage('บันทึกการแก้ไขแล้ว')
      return alert
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeAlert(alertId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteAlert(alertId)
      const targetPage = alerts.length === 1 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page
      await loadAlerts({ page: targetPage, pageSize: pagination.pageSize })
      setSuccessMessage('ลบการแจ้งเตือนแล้ว')
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
    addAlert,
    alerts,
    bookOptions,
    clearError,
    clearSuccessMessage,
    editAlert,
    error,
    isLoading,
    isBookOptionsLoading,
    isMutating,
    loadAlerts,
    pagination,
    removeAlert,
    successMessage,
  }
}
