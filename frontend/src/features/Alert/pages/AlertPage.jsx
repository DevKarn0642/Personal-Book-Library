import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space } from 'antd'
import { useState } from 'react'
import { AlertList } from '../components/AlertList.jsx'
import { AlertModal } from '../components/AlertModal.jsx'
import { useAlerts } from '../hooks/useAlerts.js'

export function AlertPage() {
  const [editingAlert, setEditingAlert] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    addAlert,
    alerts,
    bookOptions,
    clearError,
    clearSuccessMessage,
    editAlert,
    error,
    isLoading,
    isBookOptionsLoading,
    isMutating,
    loadAlerts,
    pagination,
    removeAlert,
    successMessage,
  } = useAlerts()

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingAlert(null)
    setIsModalOpen(true)
  }

  function openEditModal(alert) {
    clearError()
    clearSuccessMessage()
    setEditingAlert(alert)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingAlert(null)
  }

  async function handleSubmit(alertInput) {
    const alert = editingAlert
      ? await editAlert(editingAlert.alert_id, alertInput)
      : await addAlert(alertInput)

    if (alert) {
      closeModal()
    }

    return alert
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {error && (
        <Alert closable message={error} onClose={clearError} showIcon type="error" />
      )}

      {successMessage && (
        <Alert
          closable
          message={successMessage}
          onClose={clearSuccessMessage}
          showIcon
          type="success"
        />
      )}

      <Card
        extra={(
          <Button disabled={isLoading || isMutating} icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            เพิ่มการแจ้งเตือน
          </Button>
        )}
        title="รายการแจ้งเตือน"
      >
        <AlertList
          alerts={alerts}
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeAlert}
          onEdit={openEditModal}
          onPageChange={(page, pageSize) => loadAlerts({ page, pageSize })}
          pagination={pagination}
        />
      </Card>

      <AlertModal
        alert={editingAlert}
        bookOptions={bookOptions}
        isBookOptionsLoading={isBookOptionsLoading}
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Space>
  )
}
