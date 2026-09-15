import { Table, Tag } from 'antd'

function renderBookType(bookType) {
  return bookType === 'file'
    ? <Tag color="blue">ไฟล์</Tag>
    : <Tag>เล่ม</Tag>
}

function renderPageCount(pageCount) {
  return pageCount === null || pageCount === undefined
    ? '-'
    : Number(pageCount).toLocaleString()
}

function renderAuthor(_, book) {
  if (!book.author_name) return '-'
  return book.author_pen_name ? `${book.author_name} (${book.author_pen_name})` : book.author_name
}

function renderShelfStatus(_, book) {
  if (!book.shelf_floor_book_id) return <Tag color="orange">ยังไม่ได้บันทึกชั้น</Tag>

  return (
    <Tag color="green">
      {`${book.shelf_name} · ชั้นย่อย ${book.shelf_floor}`}
    </Tag>
  )
}

export function BookArrangementList({
  books,
  isLoading,
  onPageChange,
  onSelectBook,
  pagination,
  selectedBookId,
}) {
  const columns = [
    {
      key: 'index',
      title: 'ลำดับ',
      width: 80,
      render: (_, __, index) => ((pagination.page - 1) * pagination.pageSize) + index + 1,
    },
    {
      dataIndex: 'book_name',
      key: 'book_name',
      title: 'หนังสือ',
    },
    {
      dataIndex: 'category_name',
      key: 'category_name',
      title: 'หมวดหมู่',
      width: 150,
      render: (categoryName) => categoryName || '-',
    },
    {
      key: 'author_name',
      title: 'ผู้เขียน',
      width: 170,
      render: renderAuthor,
    },
    {
      dataIndex: 'book_type',
      key: 'book_type',
      title: 'ประเภท',
      width: 120,
      render: renderBookType,
    },
    {
      dataIndex: 'book_totalpage',
      key: 'book_totalpage',
      title: 'จำนวนหน้า',
      width: 130,
      render: renderPageCount,
    },
    {
      key: 'shelf_status',
      title: 'ตำแหน่งชั้นวาง',
      width: 200,
      render: renderShelfStatus,
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={books}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีหนังสือสำหรับจัดวาง' }}
      pagination={{
        current: pagination.page,
        onChange: onPageChange,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        total: pagination.total,
      }}
      rowSelection={{
        getCheckboxProps: (book) => ({
          disabled: book.book_type !== 'physical' || Boolean(book.shelf_floor_book_id),
        }),
        onChange: (_, selectedRows) => onSelectBook(selectedRows[0] || null),
        selectedRowKeys: selectedBookId ? [selectedBookId] : [],
        type: 'radio',
      }}
      rowKey="book_id"
      scroll={{ x: 1080 }}
    />
  )
}
