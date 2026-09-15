import { Modal } from 'antd'
import { ShelfFloorForm } from './ShelfFloorForm.jsx'

export function ShelfFloorModal({ categories, initialFloors, isOpen, isSubmitting, onCancel, onSubmit, shelfName }) {
  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={`จัดการชั้นย่อยใน ${shelfName}`}
      width={760}
    >
      <ShelfFloorForm
        categories={categories}
        initialFloors={initialFloors}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
