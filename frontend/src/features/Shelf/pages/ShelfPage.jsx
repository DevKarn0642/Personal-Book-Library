import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space } from 'antd'
import { useState } from 'react'
import { ShelfFloorModal } from '../components/ShelfFloorModal.jsx'
import { ShelfList } from '../components/ShelfList.jsx'
import { ShelfModal } from '../components/ShelfModal.jsx'
import { useShelfFloorCreator } from '../hooks/useShelfFloorCreator.js'
import { useShelves } from '../hooks/useShelves.js'

export function ShelfPage() {
  const [editingShelf, setEditingShelf] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShelfForFloor, setSelectedShelfForFloor] = useState(null)
  const [isShelfFloorModalOpen, setIsShelfFloorModalOpen] = useState(false)
  const {
    addShelf,
    clearError,
    clearSuccessMessage,
    editShelf,
    error,
    isLoading,
    isMutating,
    removeShelf,
    replaceShelf,
    shelves,
    successMessage,
  } = useShelves()
  const {
    addShelfFloors,
    clearError: clearShelfFloorError,
    clearSuccessMessage: clearShelfFloorSuccessMessage,
    error: shelfFloorError,
    isMutating: isShelfFloorMutating,
    successMessage: shelfFloorSuccessMessage,
  } = useShelfFloorCreator()
  const isPageMutating = isMutating || isShelfFloorMutating
  const isShelfTableBusy = isPageMutating || isShelfFloorModalOpen

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
    if (isPageMutating) return

    setIsModalOpen(false)
    setEditingShelf(null)
  }

  function openCreateShelfFloorModal(shelf) {
    clearError()
    clearSuccessMessage()
    clearShelfFloorError()
    clearShelfFloorSuccessMessage()
    setSelectedShelfForFloor(shelf)
    setIsShelfFloorModalOpen(true)
  }

  function closeShelfFloorModal() {
    if (isPageMutating) return

    setIsShelfFloorModalOpen(false)
    setSelectedShelfForFloor(null)
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

  async function handleShelfFloorSubmit(floors) {
    if (!selectedShelfForFloor) return null

    const updatedShelf = await addShelfFloors(selectedShelfForFloor, floors)

    if (updatedShelf) {
      replaceShelf(updatedShelf)
      closeShelfFloorModal()
    }

    return updatedShelf
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

      {shelfFloorError && (
        <Alert closable message={shelfFloorError} onClose={clearShelfFloorError} showIcon type="error" />
      )}

      {shelfFloorSuccessMessage && (
        <Alert
          closable
          message={shelfFloorSuccessMessage}
          onClose={clearShelfFloorSuccessMessage}
          showIcon
          type="success"
        />
      )}

      <Card
        extra={(
          <Button disabled={isShelfTableBusy} icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            ชั่นหนังสือ
          </Button>
        )}
        title="ชั้นวางหนังสือ"
      >
        <ShelfList
          isLoading={isLoading}
          isMutating={isShelfTableBusy}
          onAddFloor={openCreateShelfFloorModal}
          onDelete={removeShelf}
          onEdit={openEditModal}
          shelves={shelves}
        />
      </Card>

      <ShelfModal
        isOpen={isModalOpen}
        isSubmitting={isPageMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        shelf={editingShelf}
      />

      <ShelfFloorModal
        isOpen={isShelfFloorModalOpen}
        isSubmitting={isPageMutating}
        onCancel={closeShelfFloorModal}
        onSubmit={handleShelfFloorSubmit}
        shelfName={selectedShelfForFloor?.shelf_name || ''}
      />
    </Space>
  )
}
