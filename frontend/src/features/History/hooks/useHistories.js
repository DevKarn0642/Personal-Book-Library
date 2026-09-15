import { useCallback, useEffect, useState } from 'react'
import {
  createHistory,
  deleteHistory,
  listHistories,
  listHistoryBooks,
  updateHistory,
} from '../services/historyApi.js'

const initialPagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useHistories() {
  const [bookOptions, setBookOptions] = useState([])
  const [error, setError] = useState(null)
  const [histories, setHistories] = useState([])
  const [isBookOptionsLoading, setIsBookOptionsLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [pagination, setPagination] = useState(initialPagination)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadHistories = useCallback(async ({ page = 1, pageSize = 10 } = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await listHistories({ page, pageSize })
      setHistories(result.histories)
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

    async function loadInitialData() {
      try {
        const [historyResult, books] = await Promise.all([listHistories(), listHistoryBooks()])
        if (isMounted) {
          setHistories(historyResult.histories)
          setPagination(historyResult.pagination)
          setBookOptions(books)
        }
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError))
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsBookOptionsLoading(false)
        }
      }
    }

    loadInitialData()
    return () => { isMounted = false }
  }, [])

  async function addHistory(historyInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const history = await createHistory(historyInput)
      await loadHistories({ page: 1, pageSize: pagination.pageSize })
      setSuccessMessage('เพิ่มประวัติการอ่านแล้ว')
      return history
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editHistory(historyId, historyInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const history = await updateHistory(historyId, historyInput)
      await loadHistories({ page: pagination.page, pageSize: pagination.pageSize })
      setSuccessMessage('บันทึกการแก้ไขประวัติการอ่านแล้ว')
      return history
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeHistory(historyId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteHistory(historyId)
      const targetPage = histories.length === 1 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page
      await loadHistories({ page: targetPage, pageSize: pagination.pageSize })
      setSuccessMessage('ลบประวัติการอ่านแล้ว')
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
    addHistory,
    bookOptions,
    clearError,
    clearSuccessMessage,
    editHistory,
    error,
    histories,
    isBookOptionsLoading,
    isLoading,
    isMutating,
    loadHistories,
    pagination,
    removeHistory,
    successMessage,
  }
}
