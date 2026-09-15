import { BookOutlined } from '@ant-design/icons'
import { Button, Empty, Flex, Pagination, Space, Spin, Typography } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { LibraryBookGrid } from '../components/LibraryBookGrid.jsx'
import { LibraryBookDetailModal } from '../components/LibraryBookDetailModal.jsx'
import { LibraryFilters } from '../components/LibraryFilters.jsx'
import { useLibraryBooks } from '../hooks/useLibraryBooks.js'
import './LibraryPage.css'

export function LibraryPage() {
  const [bookName, setBookName] = useState('')
  const {
    authors,
    books,
    categories,
    closeBookDetails,
    clearError,
    detailError,
    error,
    filters,
    isLoading,
    isDetailLoading,
    isDetailOpen,
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
  } = useLibraryBooks()

  useFeedbackMessage({
    error,
    errorContent: (errorMessage, dismiss) => (
      <Space size={8}>
        <span>{errorMessage}</span>
        <Button
          onClick={() => {
            dismiss()
            reload()
          }}
          size="small"
          type="link"
        >
          ลองใหม่
        </Button>
      </Space>
    ),
    onErrorShown: clearError,
  })

  function handleBookNameSearch(value) {
    const trimmedValue = value.trim()
    setBookName(value)
    updateFilter('search', trimmedValue)
  }

  function handleReset() {
    setBookName('')
    resetFilters()
  }

  function handleOpenReader(book) {
    window.open(`/library/read/${book.book_id}`, '_blank', 'noopener')
    closeBookDetails()
  }

  const hasActiveFilters = Boolean(bookName || Object.values(filters).some(Boolean))

  return (
    <section className="library-page">
      <div className="library-page__intro">
        <div>
          <Typography.Title level={2}>คลังหนังสือ</Typography.Title>
        </div>
        <div className="library-page__count">
          <BookOutlined />
          <span>{pagination.total.toLocaleString()} รายการ</span>
        </div>
      </div>

      <LibraryFilters
        authors={authors}
        bookName={bookName}
        categories={categories}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading}
        isReferenceDataLoading={isReferenceDataLoading}
        onBookNameChange={setBookName}
        onReset={handleReset}
        onSearchBookName={handleBookNameSearch}
        onUpdateFilter={updateFilter}
        shelves={shelves}
      />

      {isLoading ? (
        <Flex align="center" className="library-page__loading" justify="center">
          <Spin size="large" />
        </Flex>
      ) : books.length > 0 ? (
        <>
          <LibraryBookGrid
            authors={authors}
            books={books}
            categories={categories}
            onSelectBook={(book) => openBookDetails(book.book_id)}
          />
          {pagination.totalPages > 1 && (
            <Flex justify="center" style={{ marginTop: 28 }}>
              <Pagination
                current={page}
                onChange={setPage}
                pageSize={pagination.pageSize}
                showSizeChanger={false}
                showTotal={(total) => `ทั้งหมด ${total.toLocaleString()} รายการ`}
                total={pagination.total}
              />
            </Flex>
          )}
        </>
      ) : (
        <Empty
          className="library-page__empty"
          description={hasActiveFilters ? 'ไม่พบหนังสือตามตัวกรองที่เลือก' : 'ยังไม่มีหนังสือในคลัง'}
        />
      )}

      <LibraryBookDetailModal
        authors={authors}
        book={selectedBook}
        categories={categories}
        error={detailError}
        isLoading={isDetailLoading}
        onClose={closeBookDetails}
        onReadBook={handleOpenReader}
        onRetry={() => openBookDetails(selectedBookId)}
        open={isDetailOpen}
      />

    </section>
  )
}
