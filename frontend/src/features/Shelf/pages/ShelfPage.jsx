import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Space } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { ShelfFloorModal } from '../components/ShelfFloorModal.jsx'
import { ShelfList } from '../components/ShelfList.jsx'
import { ShelfModal } from '../components/ShelfModal.jsx'
import { useShelfFloorCreator } from '../hooks/useShelfFloorCreator.js'
import { useShelves } from '../hooks/useShelves.js'

const EMPTY_SHELF_FLOORS = []

function toFormFloors(shelfFloors) {
  return shelfFloors.map((shelfFloor) => ({
    categoryId: shelfFloor.category_id === null || shelfFloor.category_id === undefined
      ? undefined
      : String(shelfFloor.category_id),
    shelfFloorId: shelfFloor.shelf_floor_id,
    shelfFloor: Number(shelfFloor.shelf_floor),
    shelfFloorLimit: Number(shelfFloor.shelf_floor_limit),
  }))
}

export function ShelfPage() {
  const [editingShelf, setEditingShelf] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialShelfFloors, setInitialShelfFloors] = useState(EMPTY_SHELF_FLOORS)
  const [selectedShelfForFloor, setSelectedShelfForFloor] = useState(null)
  const [isShelfFloorModalOpen, setIsShelfFloorModalOpen] = useState(false)
  const {
    addShelf,
    clearError,
    clearSuccessMessage,
    editShelf,
    error,
    fetchShelf,
    isFetchingShelf,
    isLoading,
    isMutating,
    removeShelf,
    replaceShelf,
    shelves,
    successMessage,
  } = useShelves()
  const {
    categories: shelfFloorCategories,
    clearError: clearShelfFloorError,
    clearSuccessMessage: clearShelfFloorSuccessMessage,
    error: shelfFloorError,
    isLoading: isShelfFloorLoading,
    isMutating: isShelfFloorMutating,
    loadShelfFloors,
    saveShelfFloors,
    successMessage: shelfFloorSuccessMessage,
  } = useShelfFloorCreator()
  const isPageMutating = isMutating || isShelfFloorMutating
  const isShelfTableBusy = isPageMutating
    || isFetchingShelf
    || isShelfFloorLoading
    || isShelfFloorModalOpen

  useFeedbackMessage({
    error,
    onErrorShown: clearError,
    onSuccessShown: clearSuccessMessage,
    successMessage,
  })
  useFeedbackMessage({
    error: shelfFloorError,
    onErrorShown: clearShelfFloorError,
    onSuccessShown: clearShelfFloorSuccessMessage,
    successMessage: shelfFloorSuccessMessage,
  })

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingShelf(null)
    setIsModalOpen(true)
  }

  async function openEditModal(shelf) {
    clearError()
    clearSuccessMessage()
    const latestShelf = await fetchShelf(shelf.shelf_id)

    if (!latestShelf) return

    setEditingShelf(latestShelf)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isPageMutating) return

    setIsModalOpen(false)
    setEditingShelf(null)
  }

  async function openCreateShelfFloorModal(shelf) {
    clearError()
    clearSuccessMessage()
    clearShelfFloorError()
    clearShelfFloorSuccessMessage()

    const shelfFloors = await loadShelfFloors(shelf.shelf_id)

    if (!shelfFloors) return

    setInitialShelfFloors(toFormFloors(shelfFloors))
    setSelectedShelfForFloor(shelf)
    setIsShelfFloorModalOpen(true)
  }

  function closeShelfFloorModal() {
    if (isPageMutating) return

    setIsShelfFloorModalOpen(false)
    setInitialShelfFloors(EMPTY_SHELF_FLOORS)
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

    const updatedShelf = await saveShelfFloors(selectedShelfForFloor, floors)

    if (updatedShelf) {
      replaceShelf(updatedShelf)
      closeShelfFloorModal()
    }

    return updatedShelf
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        extra={(
          <Button disabled={isShelfTableBusy} icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            ชั่นหนังสือ
          </Button>
        )}
        title="ชั้นวางหนังสือ"
      >
        <ShelfList
          isLoading={isLoading || isFetchingShelf || isShelfFloorLoading}
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
        categories={shelfFloorCategories}
        initialFloors={initialShelfFloors}
        isOpen={isShelfFloorModalOpen}
        isSubmitting={isPageMutating}
        onCancel={closeShelfFloorModal}
        onSubmit={handleShelfFloorSubmit}
        shelfName={selectedShelfForFloor?.shelf_name || ''}
      />
    </Space>
  )
}
