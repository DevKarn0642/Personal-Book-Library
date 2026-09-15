import { useEffect, useState } from 'react'
import {
  assignBookToShelfFloor,
  listBookArrangementReferenceData,
  listBookArrangementShelves,
  listBooksForArrangement,
} from '../services/bookArrangementApi.js'

const initialPagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }
const initialFilters = {
  authorId: undefined,
  bookType: undefined,
  categoryId: undefined,
  search: '',
  shelfStatus: 'all',
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useBookArrangement() {
  const [authors, setAuthors] = useState([])
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [pagination, setPagination] = useState(initialPagination)
  const [shelves, setShelves] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      try {
        const [result, referenceData, loadedShelves] = await Promise.all([
          listBooksForArrangement(initialFilters),
          listBookArrangementReferenceData(),
          listBookArrangementShelves(),
        ])
        if (!isMounted) return

        setBooks(result.books)
        setPagination(result.pagination)
        setAuthors(referenceData.authors)
        setCategories(referenceData.categories)
        setShelves(loadedShelves)
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadInitialData()
    return () => { isMounted = false }
  }, [])

  async function loadBooks({ nextFilters = filters, page = 1, pageSize = pagination.pageSize } = {}) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await listBooksForArrangement({ ...nextFilters, page, pageSize })
      setBooks(result.books)
      setPagination(result.pagination)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  async function applyFilters(nextFilters) {
    setFilters(nextFilters)
    await loadBooks({ nextFilters, page: 1, pageSize: pagination.pageSize })
  }

  async function assignBook(bookId, shelfFloorId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await assignBookToShelfFloor(bookId, shelfFloorId)
      const [bookResult, loadedShelves] = await Promise.all([
        listBooksForArrangement({ ...filters, page: pagination.page, pageSize: pagination.pageSize }),
        listBookArrangementShelves(),
      ])
      setBooks(bookResult.books)
      setPagination(bookResult.pagination)
      setShelves(loadedShelves)
      setSuccessMessage('บันทึกตำแหน่งหนังสือแล้ว')
      return true
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
    applyFilters,
    assignBook,
    authors,
    books,
    categories,
    clearError,
    clearSuccessMessage,
    error,
    filters,
    isLoading,
    isMutating,
    loadBooks,
    pagination,
    shelves,
    successMessage,
  }
}
