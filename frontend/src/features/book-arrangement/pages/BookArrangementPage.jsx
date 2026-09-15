import { Card, Space } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { BookArrangementAssignmentModal } from '../components/BookArrangementAssignmentModal.jsx'
import { BookArrangementFilters } from '../components/BookArrangementFilters.jsx'
import { BookArrangementList } from '../components/BookArrangementList.jsx'
import { useBookArrangement } from '../hooks/useBookArrangement.js'

export function BookArrangementPage() {
  const [selectedBook, setSelectedBook] = useState(null)
  const {
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
  } = useBookArrangement()

  useFeedbackMessage({
    error,
    onErrorShown: clearError,
    onSuccessShown: clearSuccessMessage,
    successMessage,
  })

  async function handleAssign(shelfFloorId) {
    if (!selectedBook) return false

    const wasAssigned = await assignBook(selectedBook.book_id, shelfFloorId)
    if (wasAssigned) setSelectedBook(null)
    return wasAssigned
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="รายการหนังสือสำหรับจัดวาง">
        <BookArrangementFilters
          authors={authors}
          categories={categories}
          filters={filters}
          isLoading={isLoading || isMutating}
          onApply={applyFilters}
        />
        <BookArrangementList
          books={books}
          isLoading={isLoading || isMutating}
          onPageChange={(page, pageSize) => loadBooks({ page, pageSize })}
          onSelectBook={setSelectedBook}
          pagination={pagination}
        />
      </Card>

      <BookArrangementAssignmentModal
        book={selectedBook}
        isOpen={Boolean(selectedBook)}
        isSubmitting={isMutating}
        key={selectedBook?.book_id || 'empty'}
        onCancel={() => setSelectedBook(null)}
        onSubmit={handleAssign}
        shelves={shelves}
      />
    </Space>
  )
}
