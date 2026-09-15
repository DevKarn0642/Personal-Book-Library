import {
  BookOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Descriptions, Image, Modal, Space, Spin, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { API_BASE_URL } from '../../../services/api.js'

function getFileUrl(filePath) {
  return /^https?:\/\//i.test(filePath) ? filePath : `${API_BASE_URL}${filePath}`
}

function getAuthorName(book, authorsById) {
  const author = authorsById.get(String(book.author_id))
  if (!author) return 'ไม่ระบุผู้เขียน'

  return author.author_pen_name
    ? `${author.author_name} (${author.author_pen_name})`
    : author.author_name
}

function getShelfLocations(book) {
  if (Array.isArray(book.shelf_locations)) return book.shelf_locations

  try {
    return JSON.parse(book.shelf_locations || '[]')
  } catch {
    return []
  }
}

function formatPublicationDate(bookDate) {
  const date = dayjs(bookDate)
  return date.isValid() ? date.format('DD/MM/YYYY') : bookDate
}

export function LibraryBookDetailModal({
  authors,
  book,
  categories,
  error,
  isLoading,
  onClose,
  onRetry,
  open,
}) {
  const authorsById = new Map(authors.map((author) => [String(author.author_id), author]))
  const categoriesById = new Map(categories.map((category) => [String(category.category_id), category]))
  const categoryName = book ? categoriesById.get(String(book.category_id))?.category_name || 'ไม่ระบุหมวดหมู่' : ''
  const shelfLocations = book ? getShelfLocations(book) : []

  return (
    <Modal
      destroyOnHidden
      footer={null}
      onCancel={onClose}
      open={open}
      title="รายละเอียดหนังสือ"
      width={760}
    >
      {isLoading ? (
        <div className="library-book-detail__loading"><Spin size="large" /></div>
      ) : error ? (
        <Alert action={<Typography.Link onClick={onRetry}>ลองใหม่</Typography.Link>} message={error} showIcon type="error" />
      ) : book && (
        <div className="library-book-detail">
          <div className="library-book-detail__cover">
            {book.book_cover_image ? (
              <Image alt={`หน้าปก ${book.book_name}`} src={getFileUrl(book.book_cover_image)} />
            ) : (
              <BookOutlined aria-hidden="true" />
            )}
          </div>
          <div className="library-book-detail__content">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Tag color={book.book_type === 'file' ? 'blue' : 'default'} style={{ width: 'fit-content' }}>
                {book.book_type === 'file' ? 'อีบุ๊ก' : 'หนังสือเล่ม'}
              </Tag>
              <Typography.Title level={3}>{book.book_name}</Typography.Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<><UserOutlined /> ผู้เขียน</>}>
                  {getAuthorName(book, authorsById)}
                </Descriptions.Item>
                <Descriptions.Item label={<><TagsOutlined /> หมวดหมู่</>}>
                  {categoryName}
                </Descriptions.Item>
                {book.book_date && (
                  <Descriptions.Item label={<><CalendarOutlined /> วันที่เผยแพร่</>}>
                    {formatPublicationDate(book.book_date)}
                  </Descriptions.Item>
                )}
                {book.book_totalpage !== null && book.book_totalpage !== undefined && (
                  <Descriptions.Item label={<><FileTextOutlined /> จำนวนหน้า</>}>
                    {Number(book.book_totalpage).toLocaleString()} หน้า
                  </Descriptions.Item>
                )}
                {book.book_file && (
                  <Descriptions.Item label={<><FileTextOutlined /> ไฟล์หนังสือ</>}>
                    <Typography.Link href={getFileUrl(book.book_file)} rel="noreferrer" target="_blank">
                      เปิดไฟล์หนังสือ
                    </Typography.Link>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div className="library-book-detail__locations">
                <Typography.Text strong><DatabaseOutlined /> ตำแหน่งบนชั้นวาง</Typography.Text>
                {shelfLocations.length > 0 ? (
                  <Space direction="vertical" size={4}>
                    {shelfLocations.map((location) => (
                      <Typography.Text key={location.shelf_floor_id}>
                        {location.shelf_name} · ชั้นที่ {location.shelf_floor}
                      </Typography.Text>
                    ))}
                  </Space>
                ) : (
                  <Typography.Text type="secondary">ยังไม่ได้ระบุตำแหน่งบนชั้นวาง</Typography.Text>
                )}
              </div>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  )
}
