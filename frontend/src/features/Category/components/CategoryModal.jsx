import { Modal } from 'antd'
import { CategoryForm } from './CategoryForm.jsx'

export function CategoryModal({
  category,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(category)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
    >
      <CategoryForm
        category={category}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
