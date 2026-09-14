import { List } from 'antd'
import { LibraryBookCard } from './LibraryBookCard.jsx'

export function LibraryBookGrid({ authors, books, categories, onSelectBook }) {
  const authorsById = new Map(authors.map((author) => [String(author.author_id), author]))
  const categoriesById = new Map(categories.map((category) => [String(category.category_id), category]))

  return (
    <List
      className="library-book-grid"
      dataSource={books}
      grid={{ gutter: 20, lg: 4, md: 3, sm: 2, xs: 1 }}
      renderItem={(book) => (
        <List.Item>
          <LibraryBookCard
            authorsById={authorsById}
            book={book}
            categoriesById={categoriesById}
            onSelect={onSelectBook}
          />
        </List.Item>
      )}
      rowKey="book_id"
    />
  )
}
