import { useEffect, useRef, useState } from 'react'
import { getLibraryBook, listLibraryBooks, listLibraryReferenceData } from '../services/libraryApi.js'

const INITIAL_FILTERS = {
  authorId: undefined,
  bookType: undefined,
  categoryId: undefined,
  search: undefined,
  shelfId: undefined,
}
const PAGE_SIZE = 12

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
}

export function useLibraryBooks() {
  const [authors, setAuthors] = useState([])
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [bookError, setBookError] = useState(null)
  const [detailError, setDetailError] = useState(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isReferenceDataLoading, setIsReferenceDataLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 })
  const [refreshKey, setRefreshKey] = useState(0)
  const [referenceError, setReferenceError] = useState(null)
  const [shelves, setShelves] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedBookId, setSelectedBookId] = useState(null)
  const detailRequestId = useRef(0)

  useEffect(() => {
    let isCurrent = true

    async function loadReferenceData() {
      try {
        const referenceData = await listLibraryReferenceData()
        if (!isCurrent) return

        setAuthors(referenceData.authors)
        setCategories(referenceData.categories)
        setShelves(referenceData.shelves)
      } catch (requestError) {
        if (isCurrent) setReferenceError(getErrorMessage(requestError))
      } finally {
        if (isCurrent) setIsReferenceDataLoading(false)
      }
    }

    loadReferenceData()
    return () => { isCurrent = false }
  }, [refreshKey])

  useEffect(() => {
    let isCurrent = true

    async function loadBooks() {
      setIsLoading(true)

      try {
        const result = await listLibraryBooks({ ...filters, page, pageSize: PAGE_SIZE })
        if (!isCurrent) return

        setBooks(result.books)
        setPagination(result.pagination)
        setBookError(null)
      } catch (requestError) {
        if (isCurrent) setBookError(getErrorMessage(requestError))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadBooks()
    return () => { isCurrent = false }
  }, [filters, page, refreshKey])

  function updateFilter(filterName, value) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value || undefined,
    }))
    setPage(1)
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }

  function reload() {
    setRefreshKey((currentKey) => currentKey + 1)
  }

  async function openBookDetails(bookId) {
    const requestId = detailRequestId.current + 1
    detailRequestId.current = requestId
    setDetailError(null)
    setIsDetailLoading(true)
    setIsDetailOpen(true)
    setSelectedBook(null)
    setSelectedBookId(bookId)

    try {
      const book = await getLibraryBook(bookId)
      if (detailRequestId.current === requestId) setSelectedBook(book)
    } catch (requestError) {
      if (detailRequestId.current === requestId) setDetailError(getErrorMessage(requestError))
    } finally {
      if (detailRequestId.current === requestId) setIsDetailLoading(false)
    }
  }

  function closeBookDetails() {
    detailRequestId.current += 1
    setIsDetailOpen(false)
  }

  return {
    authors,
    books,
    categories,
    closeBookDetails,
    clearError: () => {
      setBookError(null)
      setReferenceError(null)
    },
    detailError,
    error: bookError || referenceError,
    filters,
    isDetailLoading,
    isDetailOpen,
    isLoading,
    isReferenceDataLoading,
    page,
    pagination,
    openBookDetails,
    reload,
    resetFilters,
    setPage,
    shelves,
    selectedBook,
    selectedBookId,
    updateFilter,
  }
}
