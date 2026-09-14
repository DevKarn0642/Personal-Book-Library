import {
  BookOutlined,
  FileTextOutlined,
  TagsOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Card, Image, Space, Tag, Typography } from 'antd'
import { API_BASE_URL } from '../../../services/api.js'

function getCoverUrl(coverImage) {
  return /^https?:\/\//i.test(coverImage) ? coverImage : `${API_BASE_URL}${coverImage}`
}

function getAuthorName(book, authorsById) {
  const author = authorsById.get(String(book.author_id))
  if (!author) return 'ไม่ระบุผู้เขียน'

  return author.author_pen_name
    ? `${author.author_name} (${author.author_pen_name})`
    : author.author_name
}

export function LibraryBookCard({ authorsById, book, categoriesById, onSelect }) {
  const categoryName = categoriesById.get(String(book.category_id))?.category_name || 'ไม่ระบุหมวดหมู่'
  const isDigitalBook = book.book_type === 'file'

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(book)
    }
  }

  return (
    <Card
      aria-label={`ดูรายละเอียด ${book.book_name}`}
      className="library-book-card"
      cover={book.book_cover_image ? (
        <div className="library-book-card__cover">
          <Image
            alt={`หน้าปก ${book.book_name}`}
            preview={false}
            src={getCoverUrl(book.book_cover_image)}
            style={{ height: 264, objectFit: 'cover', width: '100%' }}
          />
        </div>
      ) : (
        <div aria-hidden="true" className="library-book-card__cover library-book-card__cover--empty">
          <BookOutlined />
        </div>
      )}
      hoverable
      onClick={() => onSelect(book)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Tag className="library-book-card__type" color={isDigitalBook ? 'blue' : 'default'}>
          {isDigitalBook ? 'อีบุ๊ก' : 'หนังสือเล่ม'}
        </Tag>
        <Typography.Title className="library-book-card__title" ellipsis={{ rows: 2 }} level={5}>
          {book.book_name}
        </Typography.Title>
        <Space align="start" className="library-book-card__detail" size={8}>
          <UserOutlined />
          <Typography.Text ellipsis>{getAuthorName(book, authorsById)}</Typography.Text>
        </Space>
        <Space align="start" className="library-book-card__detail" size={8}>
          <TagsOutlined />
          <Typography.Text ellipsis>{categoryName}</Typography.Text>
        </Space>
        {book.book_totalpage !== null && book.book_totalpage !== undefined && (
          <Space className="library-book-card__detail" size={8}>
            <FileTextOutlined />
            <Typography.Text>{Number(book.book_totalpage).toLocaleString()} หน้า</Typography.Text>
          </Space>
        )}
      </Space>
    </Card>
  )
}
