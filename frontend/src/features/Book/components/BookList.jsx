import { API_BASE_URL } from '../../../services/api.js'
import { Button, Image, Popconfirm, Space, Table, Tag, Typography } from 'antd'

function createNameMap(items, idKey, nameForItem) {
  return new Map(items.map((item) => [String(item[idKey]), nameForItem(item)]))
}

function renderOptionalValue(value, fallback = '—') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function getBookFileUrl(bookFile) {
  return /^https?:\/\//i.test(bookFile) ? bookFile : `${API_BASE_URL}${bookFile}`
}

function getBookFileName(bookFile) {
  try {
    return decodeURIComponent(bookFile.split('/').pop())
  } catch {
    return bookFile
  }
}

function renderBookType(bookType) {
  return bookType === 'file'
    ? <Tag color="blue">ไฟล์</Tag>
    : <Tag>เล่ม</Tag>
}

export function BookList({
  authors,
  books,
  categories,
  isLoading,
  isMutating,
  onDelete,
  onEdit,
  onPageChange,
  pagination,
}) {
  const categoryNames = createNameMap(categories, 'category_id', (category) => category.category_name)
  const authorNames = createNameMap(authors, 'author_id', (author) => (
    author.author_pen_name ? `${author.author_name} (${author.author_pen_name})` : author.author_name
  ))

  const columns = [
    {
      dataIndex: 'book_name',
      key: 'book_name',
      title: 'หนังสือ',
      width: 220,
    },
    {
      dataIndex: 'category_id',
      key: 'category_id',
      title: 'หมวดหมู่',
      width: 150,
      render: (categoryId) => categoryNames.get(String(categoryId)) || renderOptionalValue(categoryId),
    },
    {
      dataIndex: 'book_type',
      key: 'book_type',
      title: 'ประเภท',
      width: 150,
      render: renderBookType,
    },
    {
      dataIndex: 'book_cover_image',
      key: 'book_cover_image',
      title: 'หน้าปก',
      width: 85,
      render: (coverImage, book) => coverImage ? (
        <Image
          alt={`หน้าปก ${book.book_name}`}
          height={64}
          preview
          src={getBookFileUrl(coverImage)}
          style={{ objectFit: 'cover' }}
          width={44}
        />
      ) : '—',
    },
    {
      dataIndex: 'author_id',
      key: 'author_id',
      title: 'ผู้เขียน',
      width: 190,
      render: (authorId) => authorNames.get(String(authorId)) || renderOptionalValue(authorId),
    },
    {
      dataIndex: 'book_date',
      key: 'book_date',
      title: 'วันที่เผยแพร่',
      width: 135,
      render: renderOptionalValue,
    },
    {
      dataIndex: 'book_totalpage',
      key: 'book_totalpage',
      title: 'จำนวนหน้า',
      width: 110,
      render: renderOptionalValue,
    },
    {
      dataIndex: 'book_file',
      key: 'book_file',
      title: 'ไฟล์',
      width: 180,
      ellipsis: true,
      render: (bookFile) => bookFile ? (
        <Typography.Link href={getBookFileUrl(bookFile)} rel="noreferrer" target="_blank">
          {getBookFileName(bookFile)}
        </Typography.Link>
      ) : '—',
    },
    {
      align: 'center',
      key: 'actions',
      title: 'จัดการ',
      width: 185,
      render: (_, book) => (
        <Space>
          <Button disabled={isMutating} onClick={() => onEdit(book)}>
            แก้ไข
          </Button>
          <Popconfirm
            cancelText="ยกเลิก"
            description={`หนังสือ “${book.book_name}” จะถูกลบถาวร`}
            okButtonProps={{ loading: isMutating }}
            okText="ลบ"
            onConfirm={() => onDelete(book.book_id)}
            title="ยืนยันการลบหนังสือ?"
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
      dataSource={books}
      loading={isLoading}
      locale={{ emptyText: 'ยังไม่มีหนังสือ' }}
      pagination={{
        current: pagination.page,
        onChange: onPageChange,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
        showTotal: (total) => `ทั้งหมด ${total} รายการ`,
        total: pagination.total,
      }}
      rowKey="book_id"
      scroll={{ x: 1310 }}
    />
  )
}
