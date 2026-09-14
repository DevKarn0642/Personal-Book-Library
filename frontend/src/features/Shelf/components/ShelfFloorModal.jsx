import { Modal } from 'antd'
import { ShelfFloorForm } from './ShelfFloorForm.jsx'

export function ShelfFloorModal({ isOpen, isSubmitting, onCancel, onSubmit, shelfName }) {
  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={`เพิ่มชั้นย่อยใน ${shelfName}`}
    >
      <ShelfFloorForm
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
