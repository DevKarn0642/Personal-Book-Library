import { Modal } from 'antd'
import { ShelfFloorForm } from './ShelfFloorForm.jsx'

export function ShelfFloorModal({ initialFloors, isOpen, isSubmitting, onCancel, onSubmit, shelfName }) {
  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={`จัดการชั้นย่อยใน ${shelfName}`}
    >
      <ShelfFloorForm
        initialFloors={initialFloors}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
