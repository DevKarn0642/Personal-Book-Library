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

    try {
      const author = await createAuthor(authorName, authorPenName)
      setAuthors((currentAuthors) => [...currentAuthors, author])
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

    try {
      const updatedAuthor = await updateAuthor(authorId, authorName, authorPenName)
      setAuthors((currentAuthors) =>
        currentAuthors.map((author) =>
          String(author.author_id) === String(updatedAuthor.author_id)
            ? updatedAuthor
            : author,
        ),
      )
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

    try {
      const success = await deleteAuthor(authorId)

      if (success) {
        setAuthors((currentAuthors) =>
          currentAuthors.filter((author) => String(author.author_id) !== String(authorId)),
        )
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

  return {
    addAuthor,
    authors,
    clearError,
    editAuthor,
    error,
    isLoading,
    isMutating,
    removeAuthor,
  }
}
