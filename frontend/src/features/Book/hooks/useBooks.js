import { useCallback, useEffect, useState } from 'react'
import {
  createBook,
  deleteBook,
  listBookAuthors,
  listBookCategories,
  listBooks,
  updateBook,
} from '../services/bookApi.js'

const initialPagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 }

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useBooks() {
  const [authors, setAuthors] = useState([])
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [isReferenceDataLoading, setIsReferenceDataLoading] = useState(true)
  const [pagination, setPagination] = useState(initialPagination)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadBooks = useCallback(async ({ page = 1, pageSize = 10 } = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await listBooks({ page, pageSize })
      setBooks(result.books)
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
        const [bookResult, categoriesResult, authorsResult] = await Promise.all([
          listBooks(),
          listBookCategories(),
          listBookAuthors(),
        ])

        if (isMounted) {
          setBooks(bookResult.books)
          setPagination(bookResult.pagination)
          setCategories(categoriesResult)
          setAuthors(authorsResult)
        }
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError))
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsReferenceDataLoading(false)
        }
      }
    }

    loadInitialData()
    return () => { isMounted = false }
  }, [])

  async function addBook(bookInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const book = await createBook(bookInput)
      await loadBooks({ page: 1, pageSize: pagination.pageSize })
      setSuccessMessage('เพิ่มหนังสือแล้ว')
      return book
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editBook(bookId, bookInput) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const book = await updateBook(bookId, bookInput)
      await loadBooks({ page: pagination.page, pageSize: pagination.pageSize })
      setSuccessMessage('บันทึกการแก้ไขหนังสือแล้ว')
      return book
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeBook(bookId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteBook(bookId)
      const targetPage = books.length === 1 && pagination.page > 1
        ? pagination.page - 1
        : pagination.page
      await loadBooks({ page: targetPage, pageSize: pagination.pageSize })
      setSuccessMessage('ลบหนังสือแล้ว')
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
    addBook,
    authors,
    books,
    categories,
    clearError,
    clearSuccessMessage,
    editBook,
    error,
    isLoading,
    isMutating,
    isReferenceDataLoading,
    loadBooks,
    pagination,
    removeBook,
    successMessage,
  }
}
