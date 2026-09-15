import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Space } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { CategoryList } from '../components/CategoryList.jsx'
import { CategoryModal } from '../components/CategoryModal.jsx'
import { useCategories } from '../hooks/useCategories.js'

export function CategoryPage() {
  const [editingCategory, setEditingCategory] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    addCategory,
    categories,
    clearError,
    clearSuccessMessage,
    editCategory,
    error,
    isLoading,
    isMutating,
    removeCategory,
    successMessage,
  } = useCategories()

  useFeedbackMessage({
    error,
    onErrorShown: clearError,
    onSuccessShown: clearSuccessMessage,
    successMessage,
  })

  function openCreateModal() {
    clearError()
    clearSuccessMessage()
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  function openEditModal(category) {
    clearError()
    clearSuccessMessage()
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingCategory(null)
  }

  async function handleSubmit(categoryName) {
    const category = editingCategory
      ? await editCategory(editingCategory.category_id, categoryName)
      : await addCategory(categoryName)

    if (category) {
      closeModal()
    }

    return category
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        extra={(
          <Button icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            เพิ่มหมวดหมู่
          </Button>
        )}
        title="หมวดหมู่หนังสือ"
      >
        <CategoryList
          categories={categories}
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeCategory}
          onEdit={openEditModal}
        />
      </Card>

      <CategoryModal
        category={editingCategory}
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Space>
  )
}
