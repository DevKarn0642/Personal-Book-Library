import { Button, Popconfirm, Space, Table } from 'antd'

export function AuthorList({ authors, isLoading, isMutating, onDelete, onEdit }) {
  const columns = [
    {
      title: 'ลำดับ',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      dataIndex: 'author_name',
      key: 'author_name',
      title: 'ชื่อผู้เขียน',
    },
    {
      dataIndex: 'author_pen_name',
      key: 'author_pen_name',
      title: 'นามปากกา',
      render: (authorPenName) => authorPenName || '-',
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: 190,
      render: (_, author) => (
        <Space align="center">
          <Button disabled={isMutating} onClick={() => onEdit(author)}>
            แก้ไข
          </Button>

          <Popconfirm
            cancelText="ยกเลิก"
            description={`ผู้เขียน "${author.author_name}" จะถูกลบ`}
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(author.author_id)}
            title="ยืนยันการลบผู้เขียน?"
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
      dataSource={authors}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีผู้เขียน' }}
      pagination={{ pageSize: 10 }}
      rowKey="author_id"
      scroll={{ x: 680 }}
    />
  )
}
