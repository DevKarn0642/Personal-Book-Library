import { Modal } from 'antd'
import { AuthorForm } from './AuthorForm.jsx'

export function AuthorModal({ author, isOpen, isSubmitting, onCancel, onSubmit }) {
  const isEditing = Boolean(author)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขผู้เขียน' : 'เพิ่มผู้เขียน'}
    >
      <AuthorForm
        author={author}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
