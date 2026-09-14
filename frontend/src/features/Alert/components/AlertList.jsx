import { Button, Popconfirm, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'

function renderValue(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function renderDate(value) {
  if (value === null || value === undefined || value === '') return renderValue(value)

  const date = dayjs(value)
  return date.isValid() ? date.format('DD/MM/YYYY') : renderValue(value)
}

export function AlertList({
  alerts,
  isLoading,
  isMutating,
  onDelete,
  onEdit,
  onPageChange,
  pagination,
}) {
  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'alert_date',
      key: 'alert_date',
      width: 130,
      render: renderDate,
    },
    {
      title: 'เวลา',
      dataIndex: 'alert_time',
      key: 'alert_time',
      width: 120,
      render: (alertTime) => renderValue(alertTime),
    },
    {
      title: 'ทำซ้ำ',
      dataIndex: 'alert_repeat_type',
      key: 'alert_repeat_type',
      width: 150,
      render: (repeatType) => renderValue(repeatType, 'ไม่ทำซ้ำ'),
    },
    {
      title: 'หนังสือ',
      dataIndex: 'book_id',
      key: 'book_id',
      width: 110,
      render: (bookId) => renderValue(bookId),
    },
    {
      title: 'สถานะ',
      dataIndex: 'alert_status',
      key: 'alert_status',
      width: 125,
      render: (alertStatus) => (
        <Tag color={alertStatus ? 'success' : 'default'}>
          {alertStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </Tag>
      ),
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: 185,
      render: (_, alert) => (
        <Space>
          <Button disabled={isMutating} onClick={() => onEdit(alert)}>
            แก้ไข
          </Button>

          <Popconfirm
            cancelText="ยกเลิก"
            description="การแจ้งเตือนนี้จะถูกลบถาวร"
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(alert.alert_id)}
            title="ยืนยันการลบการแจ้งเตือน?"
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
      dataSource={alerts}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีรายการแจ้งเตือน' }}
      pagination={{
        current: pagination.page,
        onChange: onPageChange,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        total: pagination.total,
      }}
      rowKey="alert_id"
      scroll={{ x: 820 }}
    />
  )
}
