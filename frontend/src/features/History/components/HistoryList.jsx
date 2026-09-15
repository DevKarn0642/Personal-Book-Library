import { Button, Popconfirm, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'

function renderValue(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function renderDateTime(value) {
  if (!value) return renderValue(value)

  const dateTime = dayjs(value)
  return dateTime.isValid() ? dateTime.format('DD/MM/YYYY HH:mm') : renderValue(value)
}

function getBookName(bookId, bookOptions) {
  const book = bookOptions.find((item) => item.book_id === bookId)
  return book ? book.book_name : `หนังสือ #${bookId}`
}

export function HistoryList({
  bookOptions,
  histories,
  isLoading,
  isMutating,
  onDelete,
  onEdit,
  onPageChange,
  pagination,
}) {
  const columns = [
    {
      title: 'บันทึกเมื่อ',
      dataIndex: 'history_date_at',
      key: 'history_date_at',
      width: 170,
      render: renderDateTime,
    },
    {
      title: 'หนังสือ',
      dataIndex: 'book_id',
      key: 'book_id',
      render: (bookId) => getBookName(bookId, bookOptions),
    },
    {
      align: 'right',
      title: 'หน้าที่อ่าน',
      dataIndex: 'history_page',
      key: 'history_page',
      width: 125,
      render: renderValue,
    },
    {
      title: 'สถานะ',
      dataIndex: 'history_status',
      key: 'history_status',
      width: 150,
      render: (status) => status ? <Tag color="blue">{status}</Tag> : <Tag>ไม่ระบุ</Tag>,
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: 185,
      render: (_, history) => (
        <Space>
          <Button disabled={isMutating} onClick={() => onEdit(history)}>
            แก้ไข
          </Button>
          <Popconfirm
            cancelText="ยกเลิก"
            description="ประวัติการอ่านนี้จะถูกลบถาวร"
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(history.history_id)}
            title="ยืนยันการลบประวัติการอ่าน?"
          >
            <Button danger disabled={isMutating}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={histories}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีประวัติการอ่าน' }}
      pagination={{
        current: pagination.page,
        onChange: onPageChange,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        total: pagination.total,
      }}
      rowKey="history_id"
      scroll={{ x: 760 }}
    />
  )
}
