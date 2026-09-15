import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createLibraryReadingHistory,
  getLibraryLatestReadingHistory,
  updateLibraryReadingHistory,
} from '../services/libraryApi.js'

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function usePdfReadingHistory({ bookId, isOpen }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingProgress, setIsLoadingProgress] = useState(Boolean(bookId && isOpen))
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const historyRef = useRef(null)
  const loadRequestId = useRef(0)
  const pendingSaveCount = useRef(0)
  const saveQueue = useRef(Promise.resolve())

  const loadProgress = useCallback(async () => {
    if (!bookId || !isOpen) return

    const requestId = loadRequestId.current + 1
    loadRequestId.current = requestId
    historyRef.current = null
    setCurrentPage(1)
    setIsLoadingProgress(true)
    setLoadError(null)
    setSaveError(null)

    try {
      const history = await getLibraryLatestReadingHistory(bookId)
      if (loadRequestId.current === requestId) {
        historyRef.current = history
        setCurrentPage(Math.max(1, history?.history_page || 1))
      }
    } catch (error) {
      if (loadRequestId.current === requestId) {
        setLoadError(getErrorMessage(error, 'ไม่สามารถโหลดหน้าที่อ่านล่าสุดได้'))
      }
    } finally {
      if (loadRequestId.current === requestId) setIsLoadingProgress(false)
    }
  }, [bookId, isOpen])

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      void loadProgress()
    }, 0)

    return () => {
      clearTimeout(loadTimeout)
      loadRequestId.current += 1
    }
  }, [loadProgress])

  const savePage = useCallback((readingPage) => {
    if (!bookId || !isOpen || !Number.isInteger(readingPage) || readingPage < 1) {
      return Promise.resolve(false)
    }

    pendingSaveCount.current += 1
    setIsSavingProgress(true)
    setSaveError(null)

    const request = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        const history = historyRef.current
        const savedHistory = history
          ? await updateLibraryReadingHistory(history, readingPage)
          : await createLibraryReadingHistory(bookId, readingPage)
        historyRef.current = savedHistory
        return true
      })
      .catch((error) => {
        setSaveError(getErrorMessage(error, 'ไม่สามารถบันทึกหน้าที่อ่านล่าสุดได้'))
        return false
      })
      .finally(() => {
        pendingSaveCount.current -= 1
        if (pendingSaveCount.current === 0) setIsSavingProgress(false)
      })

    saveQueue.current = request
    return request
  }, [bookId, isOpen])

  return {
    currentPage,
    isLoadingProgress,
    isSavingProgress,
    loadError,
    loadProgress,
    saveError,
    savePage,
    setCurrentPage,
  }
}
