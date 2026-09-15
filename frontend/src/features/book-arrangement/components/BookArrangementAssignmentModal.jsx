import { Modal, Select, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'

function isFloorFull(floor) {
  return floor.shelf_floor_limit !== null && floor.shelf_floor_limit !== undefined &&
    Number(floor.assigned_count) >= Number(floor.shelf_floor_limit)
}

function floorLabel(floor) {
  const limitLabel = floor.shelf_floor_limit === null || floor.shelf_floor_limit === undefined
    ? 'ไม่จำกัด'
    : `${Number(floor.assigned_count)}/${Number(floor.shelf_floor_limit)}`
  const categoryLabel = floor.category_name ? ` · ${floor.category_name}` : ''

  return `ชั้นย่อย ${floor.shelf_floor} (${limitLabel})${categoryLabel}`
}

export function BookArrangementAssignmentModal({
  book,
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
  shelves,
}) {
  const [shelfId, setShelfId] = useState(undefined)
  const [shelfFloorId, setShelfFloorId] = useState(undefined)

  const selectedShelf = useMemo(
    () => shelves.find((shelf) => String(shelf.shelf_id) === String(shelfId)),
    [shelfId, shelves],
  )

  async function handleOk() {
    if (!shelfFloorId) return
    await onSubmit(shelfFloorId)
  }

  return (
    <Modal
      cancelButtonProps={{ disabled: isSubmitting }}
      cancelText="ยกเลิก"
      confirmLoading={isSubmitting}
      okButtonProps={{ disabled: !shelfFloorId }}
      okText="บันทึกตำแหน่ง"
      onCancel={onCancel}
      onOk={handleOk}
      open={isOpen}
      title="เลือกตำแหน่งหนังสือ"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Typography.Text>
          หนังสือ: <Typography.Text strong>{book?.book_name}</Typography.Text>
        </Typography.Text>

        <div>
          <Typography.Text strong>ชั้นวาง</Typography.Text>
          <Select
            disabled={isSubmitting}
            onChange={(value) => {
              setShelfId(value)
              setShelfFloorId(undefined)
            }}
            options={shelves.map((shelf) => ({ label: shelf.shelf_name, value: String(shelf.shelf_id) }))}
            placeholder="เลือกชั้นวาง"
            style={{ marginTop: 8, width: '100%' }}
          />
        </div>

        <div>
          <Typography.Text strong>ชั้นย่อย</Typography.Text>
          <Select
            disabled={!selectedShelf || isSubmitting}
            onChange={setShelfFloorId}
            options={selectedShelf?.floors.map((floor) => ({
              disabled: isFloorFull(floor),
              label: floorLabel(floor),
              value: String(floor.shelf_floor_id),
            })) || []}
            placeholder={selectedShelf ? 'เลือกชั้นย่อย' : 'เลือกชั้นวางก่อน'}
            style={{ marginTop: 8, width: '100%' }}
          />
          {selectedShelf?.floors.length === 0 && (
            <Typography.Text type="secondary">ชั้นวางนี้ยังไม่มีชั้นย่อย</Typography.Text>
          )}
        </div>
      </Space>
    </Modal>
  )
}
