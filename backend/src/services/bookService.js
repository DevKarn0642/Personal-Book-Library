function createBookService({ bookModel }) {
  async function createBook(bookInput) {
    return bookModel.create(bookInput);
  }

  async function listBooks({ filters, limit, offset }) {
    const [books, total] = await Promise.all([
      bookModel.findPage({ filters, limit, offset }),
      bookModel.countAll(filters),
    ]);

    return { books, total: Number(total) };
  }

  async function getBookById(bookId) {
    return bookModel.findById(bookId);
  }

  async function updateBook(bookId, bookInput) {
    return bookModel.update(bookId, bookInput);
  }

  async function deleteBook(bookId) {
    return bookModel.remove(bookId);
  }

  return { createBook, deleteBook, getBookById, listBooks, updateBook };
}

module.exports = { createBookService };
