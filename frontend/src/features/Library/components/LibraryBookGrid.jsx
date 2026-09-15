import { LibraryBookCard } from './LibraryBookCard.jsx'

export function LibraryBookGrid({ authors, books, categories, onSelectBook }) {
  const authorsById = new Map(authors.map((author) => [String(author.author_id), author]))
  const categoriesById = new Map(categories.map((category) => [String(category.category_id), category]))

  return (
    <div className="library-book-grid" role="list">
      {books.map((book) => (
        <div className="library-book-grid__item" key={book.book_id} role="listitem">
          <LibraryBookCard
            authorsById={authorsById}
            book={book}
            categoriesById={categoriesById}
            onSelect={onSelectBook}
          />
        </div>
      ))}
    </div>
  )
}
