import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space } from 'antd'
import { useState } from 'react'
import { BookList } from '../components/BookList.jsx'
import { BookModal } from '../components/BookModal.jsx'
import { useBooks } from '../hooks/useBooks.js'

export function BookPage() {
  const [editingBook, setEditingBook] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
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
  } = useBooks()

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingBook(null)
    setIsModalOpen(true)
  }

  function openEditModal(book) {
    clearError()
    clearSuccessMessage()
    setEditingBook(book)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingBook(null)
  }

  async function handleSubmit(bookInput) {
    const book = editingBook
      ? await editBook(editingBook.book_id, bookInput)
      : await addBook(bookInput)

    if (book) closeModal()
    return book
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {error && <Alert closable message={error} onClose={clearError} showIcon type="error" />}
      {successMessage && (
        <Alert closable message={successMessage} onClose={clearSuccessMessage} showIcon type="success" />
      )}

      <Card
        extra={(
          <Button
            disabled={isLoading || isMutating}
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            type="primary"
          >
            เพิ่มหนังสือ
          </Button>
        )}
        title="รายการหนังสือ"
      >
        <BookList
          authors={authors}
          books={books}
          categories={categories}
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeBook}
          onEdit={openEditModal}
          onPageChange={(page, pageSize) => loadBooks({ page, pageSize })}
          pagination={pagination}
        />
      </Card>

      <BookModal
        authors={authors}
        book={editingBook}
        categories={categories}
        isOpen={isModalOpen}
        isReferenceDataLoading={isReferenceDataLoading}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Space>
  )
}
