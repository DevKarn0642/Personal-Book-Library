import { useCallback, useEffect, useState } from 'react'
import {
  createAuthor,
  deleteAuthor,
  listAuthors,
  updateAuthor,
} from '../services/authorApi.js'

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
}

export function useAuthors() {
  const [authors, setAuthors] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const loadAuthors = useCallback(async () => {
    try {
      const result = await listAuthors()
      setAuthors(result)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAuthors()
  }, [loadAuthors])

  async function addAuthor(authorName, authorPenName) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const author = await createAuthor(authorName, authorPenName)
      setAuthors((currentAuthors) => [...currentAuthors, author])
      setSuccessMessage('เพิ่มผู้เขียนแล้ว')
      return author
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function editAuthor(authorId, authorName, authorPenName) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updatedAuthor = await updateAuthor(authorId, authorName, authorPenName)
      setAuthors((currentAuthors) =>
        currentAuthors.map((author) =>
          String(author.author_id) === String(updatedAuthor.author_id)
            ? updatedAuthor
            : author,
        ),
      )
      setSuccessMessage('บันทึกการแก้ไขผู้เขียนแล้ว')
      return updatedAuthor
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return null
    } finally {
      setIsMutating(false)
    }
  }

  async function removeAuthor(authorId) {
    setIsMutating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const success = await deleteAuthor(authorId)

      if (success) {
        setAuthors((currentAuthors) =>
          currentAuthors.filter((author) => String(author.author_id) !== String(authorId)),
        )
        setSuccessMessage('ลบผู้เขียนแล้ว')
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
    addAuthor,
    authors,
    clearError,
    clearSuccessMessage,
    editAuthor,
    error,
    isLoading,
    isMutating,
    removeAuthor,
    successMessage,
  }
}
