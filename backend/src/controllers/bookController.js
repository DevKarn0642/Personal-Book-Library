const {
  discardStoredBookUpload,
  discardUploadedBookFiles,
} = require('../middlewares/uploadBookFile');

function createBookController({ bookService }) {
  async function create(req, res, next) {
    try {
      const book = await bookService.createBook(req.bookInput);
      return res.status(201).json({ book });
    } catch (error) {
      await discardUploadedBookFiles(req.files);
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { books, total } = await bookService.listBooks({
        filters: req.bookFilters,
        limit: pageSize,
        offset,
      });
      return res.json({
        books,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      const book = await bookService.getBookById(req.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
      }
      return res.json({ book });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const previousBook = await bookService.getBookById(req.bookId);
      if (!previousBook) {
        await discardUploadedBookFiles(req.files);
        return res.status(404).json({ message: 'Book not found.' });
      }

      const book = await bookService.updateBook(req.bookId, req.bookInput);
      if (!book) {
        await discardUploadedBookFiles(req.files);
        return res.status(404).json({ message: 'Book not found.' });
      }

      if (previousBook.book_file !== book.book_file) {
        await discardStoredBookUpload(previousBook.book_file, req.bookUploadDirectories);
      }
      if (previousBook.book_cover_image !== book.book_cover_image) {
        await discardStoredBookUpload(previousBook.book_cover_image, req.bookUploadDirectories);
      }
      return res.json({ book });
    } catch (error) {
      await discardUploadedBookFiles(req.files);
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const book = await bookService.deleteBook(req.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found.' });
      }
      await discardStoredBookUpload(book.book_file, req.bookUploadDirectories);
      await discardStoredBookUpload(book.book_cover_image, req.bookUploadDirectories);
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, getById, list, remove, update };
}

module.exports = { createBookController };
