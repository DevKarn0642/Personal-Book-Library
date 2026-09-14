function createBookModel({ pool }) {
  const bookColumns = 'book_id, category_id, author_id, book_type, book_name, book_date, book_totalpage, book_file, book_cover_image';

  function createFilterClause({ authorId, bookType, categoryId, search, shelfId } = {}) {
    const clauses = [];
    const values = [];

    function addClause(sql, value) {
      values.push(value);
      clauses.push(sql.replace('?', `$${values.length}`));
    }

    if (bookType) addClause('book_type = ?', bookType);
    if (categoryId) addClause('category_id = ?', categoryId);
    if (authorId) addClause('author_id = ?', authorId);
    if (search) addClause('book_name ILIKE ?', `%${search}%`);
    if (shelfId) {
      addClause(
        `EXISTS (
           SELECT 1
           FROM shelf_floor
           WHERE shelf_floor.book_id = book.book_id
             AND shelf_floor.shelf_id = ?
         )`,
        shelfId,
      );
    }

    return {
      values,
      whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    };
  }

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

  async function findPage({ filters, limit, offset }) {
    const { values, whereClause } = createFilterClause(filters);
    const limitPosition = values.length + 1;
    const offsetPosition = values.length + 2;
    const { rows } = await pool.query(
      `SELECT ${bookColumns}
       FROM book
       ${whereClause}
       ORDER BY book_id ASC
       LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
      [...values, limit, offset],
    );
    return rows;
  }

  async function countAll(filters) {
    const { values, whereClause } = createFilterClause(filters);
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total
       FROM book
       ${whereClause}`,
      values,
    );
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
