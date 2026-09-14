import { Button, Popconfirm, Space, Table } from 'antd'

function renderShelfLimit(shelfLimit) {
  return shelfLimit === null || shelfLimit === undefined
    ? '-'
    : Number(shelfLimit).toLocaleString()
}

export function ShelfList({
  shelves,
  isLoading,
  isMutating,
  onDelete,
  onEdit,
  onAddFloor,
}) {
  const columns = [
    {
      title: 'ลำดับ',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: 'shelf_name',
      key: 'shelf_name',
      title: 'ชื่อชั้นวาง',
    },
    {
      dataIndex: 'shelf_limit',
      key: 'shelf_limit',
      title: 'จำนวนสูงสุด',
      width: 130,
      render: renderShelfLimit,
    },
    {
      dataIndex: 'shelf_color',
      key: 'shelf_color',
      title: 'สี',
      render: (shelfColor) => shelfColor || '-',
    },
    {
      dataIndex: 'shelf_material',
      key: 'shelf_material',
      title: 'วัสดุ',
      render: (shelfMaterial) => shelfMaterial || '-',
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: 290,
      render: (_, shelf) => (
        <Space align="center">
          <Button disabled={isMutating} onClick={() => onAddFloor(shelf)} type="primary">
            เพิ่มชั้นย่อย
          </Button>

          <Button disabled={isMutating} onClick={() => onEdit(shelf)}>
            แก้ไข
          </Button>

          <Popconfirm
            cancelText="ยกเลิก"
            description={`ชั้นวาง "${shelf.shelf_name}" จะถูกลบ`}
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(shelf.shelf_id)}
            title="ยืนยันการลบชั้นวาง?"
          >
            <Button danger disabled={isMutating}>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={shelves}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีชั้นวางหนังสือ' }}
      pagination={{ pageSize: 10 }}
      rowKey="shelf_id"
      scroll={{ x: 1000 }}
    />
  )
}
