import { Modal } from 'antd'
import { BookForm } from './BookForm.jsx'

export function BookModal({
  authors,
  book,
  categories,
  isOpen,
  isReferenceDataLoading,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(book)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือ'}
    >
      <BookForm
        authors={authors}
        book={book}
        categories={categories}
        isReferenceDataLoading={isReferenceDataLoading}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
