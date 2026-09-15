import { Button, Flex, Space, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { PdfReader } from '../components/PdfReaderModal.jsx'
import { getLibraryBook } from '../services/libraryApi.js'
import './PdfReaderPage.css'

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'ไม่สามารถโหลดหนังสือได้'
}

export function PdfReaderPage() {
  const { bookId } = useParams()
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const numericBookId = Number(bookId)
  const isValidBookId = Number.isInteger(numericBookId) && numericBookId > 0
  const pageError = isValidBookId ? error : 'ไม่พบหนังสือที่ต้องการอ่าน'

  useFeedbackMessage({
    error: pageError,
    errorContent: isValidBookId
      ? (errorMessage, dismiss) => (
        <Space size={8}>
          <span>{errorMessage}</span>
          <Button
            onClick={() => {
              dismiss()
              setReloadKey((value) => value + 1)
            }}
            size="small"
            type="link"
          >
            ลองใหม่
          </Button>
        </Space>
      )
      : undefined,
  })

  useEffect(() => {
    if (!isValidBookId) return undefined

    let isCurrent = true

    async function loadBook() {
      setIsLoading(true)
      setError(null)

      try {
        const loadedBook = await getLibraryBook(numericBookId)
        if (isCurrent) setBook(loadedBook)
      } catch (requestError) {
        if (isCurrent) setError(getErrorMessage(requestError))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadBook()
    return () => { isCurrent = false }
  }, [isValidBookId, numericBookId, reloadKey])

  if (!isValidBookId) {
    return <main className="pdf-reader-page" />
  }

  return (
    <main className="pdf-reader-page">
      {isLoading ? (
        <Flex align="center" className="pdf-reader-page__loading" justify="center"><Spin size="large" /></Flex>
      ) : book ? (
        <>
          <Typography.Title className="pdf-reader-page__title" level={3}>อ่าน: {book.book_name}</Typography.Title>
          <PdfReader book={book} />
        </>
      ) : null}
    </main>
  )
}
