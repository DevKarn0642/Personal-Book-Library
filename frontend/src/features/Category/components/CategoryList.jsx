import { Button, Popconfirm, Space, Table } from 'antd'

export function CategoryList({
  categories,
  isLoading,
  isMutating,
  onDelete,
  onEdit,
}) {
  const columns = [
    {
      title: 'ลำดับ',
      width: '10%',
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: 'category_name',
      key: 'category_name',
      title: 'ชื่อหมวดหมู่',
      width: '70%',
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: '20%',
      render: (_, category) => (
        <Space align="center">
          <Button
            disabled={isMutating}
            onClick={() => onEdit(category)}
          >
            แก้ไข
          </Button>

          <Popconfirm
            cancelText="ยกเลิก"
            description={`หมวดหมู่ "${category.category_name}" จะถูกลบ`}
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(category.category_id)}
            title="ยืนยันการลบหมวดหมู่?"
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
      dataSource={categories}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีหมวดหมู่' }}
      pagination={{ pageSize: 10 }}
      rowKey="category_id"
      tableLayout="fixed"
    />
  )
}
