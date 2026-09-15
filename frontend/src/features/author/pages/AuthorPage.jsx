import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Space } from 'antd'
import { useState } from 'react'
import { useFeedbackMessage } from '../../../shared/hooks/useFeedbackMessage.js'
import { AuthorList } from '../components/AuthorList.jsx'
import { AuthorModal } from '../components/AuthorModal.jsx'
import { useAuthors } from '../hooks/useAuthors.js'

export function AuthorPage() {
  const [editingAuthor, setEditingAuthor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    addAuthor,
    authors,
    clearError,
    editAuthor,
    error,
    isLoading,
    isMutating,
    removeAuthor,
  } = useAuthors()

  useFeedbackMessage({ error, onErrorShown: clearError })

  function openCreateModal() {
    clearError()
    setEditingAuthor(null)
    setIsModalOpen(true)
  }

  function openEditModal(author) {
    clearError()
    setEditingAuthor(author)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isMutating) return

    setIsModalOpen(false)
    setEditingAuthor(null)
  }

  async function handleSubmit(authorName, authorPenName) {
    const author = editingAuthor
      ? await editAuthor(editingAuthor.author_id, authorName, authorPenName)
      : await addAuthor(authorName, authorPenName)

    if (author) {
      closeModal()
    }

    return author
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        extra={(
          <Button icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
            เพิ่มผู้เขียน
          </Button>
        )}
        title="ผู้เขียน"
      >
        <AuthorList
          authors={authors}
          isLoading={isLoading}
          isMutating={isMutating}
          onDelete={removeAuthor}
          onEdit={openEditModal}
        />
      </Card>

      <AuthorModal
        author={editingAuthor}
        isOpen={isModalOpen}
        isSubmitting={isMutating}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </Space>
  )
}
