function createBookModel({ pool }) {
  const bookColumns = 'book_id, category_id, author_id, book_type, book_name, book_date, book_totalpage, book_file, book_cover_image';

  async function create({
    categoryId,
    authorId,
    bookType,
    bookName,
    bookDate,
    bookTotalPage,
    bookFile,
    bookCoverImage,
  }) {
    const { rows } = await pool.query(
      `INSERT INTO book (
         category_id,
         author_id,
         book_type,
         book_name,
         book_date,
         book_totalpage,
         book_file,
         book_cover_image
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${bookColumns}`,
      [categoryId, authorId, bookType, bookName, bookDate, bookTotalPage, bookFile, bookCoverImage],
    );
    return rows[0];
  }

  async function findPage({ limit, offset }) {
    const { rows } = await pool.query(
      `SELECT ${bookColumns}
       FROM book
       ORDER BY book_id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return rows;
  }

  async function countAll() {
    const { rows } = await pool.query('SELECT COUNT(*) AS total FROM book');
    return rows[0].total;
  }

  async function findById(bookId) {
    const { rows } = await pool.query(
      `SELECT ${bookColumns}
       FROM book
       WHERE book_id = $1
       LIMIT 1`,
      [bookId],
    );
    return rows[0];
  }

  async function update(bookId, {
    categoryId,
    authorId,
    bookType,
    bookName,
    bookDate,
    bookTotalPage,
    bookFile,
    bookCoverImage,
  }) {
    const { rows } = await pool.query(
      `UPDATE book
       SET category_id = $1,
           author_id = $2,
           book_type = $3,
           book_name = $4,
           book_date = $5,
           book_totalpage = $6,
           book_file = $7,
           book_cover_image = $8
       WHERE book_id = $9
       RETURNING ${bookColumns}`,
      [categoryId, authorId, bookType, bookName, bookDate, bookTotalPage, bookFile, bookCoverImage, bookId],
    );
    return rows[0];
  }

  async function remove(bookId) {
    const { rows } = await pool.query(
      `DELETE FROM book
       WHERE book_id = $1
       RETURNING ${bookColumns}`,
      [bookId],
    );
    return rows[0];
  }

  return { countAll, create, findById, findPage, remove, update };
}

module.exports = { createBookModel };
