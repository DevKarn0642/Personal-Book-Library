import { Modal } from 'antd'
import { HistoryForm } from './HistoryForm.jsx'

export function HistoryModal({
  bookOptions,
  history,
  isBookOptionsLoading,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(history)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขประวัติการอ่าน' : 'เพิ่มประวัติการอ่าน'}
    >
      <HistoryForm
        bookOptions={bookOptions}
        history={history}
        isBookOptionsLoading={isBookOptionsLoading}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
