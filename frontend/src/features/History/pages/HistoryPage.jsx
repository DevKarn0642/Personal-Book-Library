import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Space } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { HistoryList } from '../components/HistoryList.jsx'
import { HistoryModal } from '../components/HistoryModal.jsx'
import { useHistories } from '../hooks/useHistories.js'

export function HistoryPage() {
  const [editingHistory, setEditingHistory] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    addHistory,
    bookOptions,
    clearError,
    clearSuccessMessage,
    editHistory,
    error,
    histories,
    isBookOptionsLoading,
    isLoading,
    isMutating,
    loadHistories,
    pagination,
    removeHistory,
    successMessage,
  } = useHistories()

  useFeedbackMessage({
    error,
    onErrorShown: clearError,
    onSuccessShown: clearSuccessMessage,
    successMessage,
  })

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingHistory(null)
    setIsModalOpen(true)
  }

  function openEditModal(history) {
    clearError()
    clearSuccessMessage()
    setEditingHistory(history)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingHistory(null)
  }

  async function handleSubmit(historyInput) {
    const history = editingHistory
      ? await editHistory(editingHistory.history_id, historyInput)
      : await addHistory(historyInput)

    if (history) closeModal()
    return history
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        extra={(
          <Button disabled={isLoading || isMutating} icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            เพิ่มประวัติการอ่าน
          </Button>
        )}
        title="ประวัติการอ่าน"
      >
        <HistoryList
          bookOptions={bookOptions}
          histories={histories}
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeHistory}
          onEdit={openEditModal}
          onPageChange={(page, pageSize) => loadHistories({ page, pageSize })}
          pagination={pagination}
        />
      </Card>

      <HistoryModal
        bookOptions={bookOptions}
        history={editingHistory}
        isBookOptionsLoading={isBookOptionsLoading}
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Space>
  )
}
