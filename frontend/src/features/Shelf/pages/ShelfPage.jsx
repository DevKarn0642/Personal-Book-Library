import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space } from 'antd'
import { useState } from 'react'
import { ShelfList } from '../components/ShelfList.jsx'
import { ShelfModal } from '../components/ShelfModal.jsx'
import { useShelves } from '../hooks/useShelves.js'

export function ShelfPage() {
  const [editingShelf, setEditingShelf] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    addShelf,
    clearError,
    clearSuccessMessage,
    editShelf,
    error,
    isLoading,
    isMutating,
    removeShelf,
    shelves,
    successMessage,
  } = useShelves()

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingShelf(null)
    setIsModalOpen(true)
  }

  function openEditModal(shelf) {
    clearError()
    clearSuccessMessage()
    setEditingShelf(shelf)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingShelf(null)
  }

  async function handleSubmit(shelfName, shelfLimit, shelfColor, shelfMaterial) {
    const shelf = editingShelf
      ? await editShelf(
        editingShelf.shelf_id,
        shelfName,
        shelfLimit,
        shelfColor,
        shelfMaterial,
      )
      : await addShelf(shelfName, shelfLimit, shelfColor, shelfMaterial)

    if (shelf) {
      closeModal()
    }

    return shelf
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
          <Button icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            เพิ่มชั้นวาง
          </Button>
        )}
        title="ชั้นวางหนังสือ"
      >
        <ShelfList
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeShelf}
          onEdit={openEditModal}
          shelves={shelves}
        />
      </Card>

      <ShelfModal
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        shelf={editingShelf}
      />
    </Space>
  )
}
