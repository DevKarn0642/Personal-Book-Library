import { Modal } from 'antd'
import { AlertForm } from './AlertForm.jsx'

export function AlertModal({
  alert,
  bookOptions,
  isBookOptionsLoading,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}) {
  const isEditing = Boolean(alert)

  return (
    <Modal
      destroyOnHidden
      footer={null}
      maskClosable={!isSubmitting}
      onCancel={onCancel}
      open={isOpen}
      title={isEditing ? 'แก้ไขการแจ้งเตือน' : 'เพิ่มการแจ้งเตือน'}
    >
      <AlertForm
        alert={alert}
        bookOptions={bookOptions}
        isBookOptionsLoading={isBookOptionsLoading}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
