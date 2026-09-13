import { Modal } from 'antd'
import { ShelfForm } from './ShelfForm.jsx'

export function ShelfModal({ shelf, isOpen, isSubmitting, onCancel, onSubmit }) {
  const isEditing = Boolean(shelf)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขชั้นวาง' : 'เพิ่มชั้นวาง'}
    >
      <ShelfForm
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
        shelf={shelf}
      />
    </Modal>
  )
}
