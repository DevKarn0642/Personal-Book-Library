function createBookArrangementModel({ pool }) {
  const bookColumns = `
    book.book_id,
    book.book_name,
    book.book_type,
    book.book_totalpage,
    book.category_id,
    category.category_name,
    book.author_id,
    author.author_name,
    author.author_pen_name,
    placement.shelf_floor_book_id,
    placement.shelf_id,
    placement.shelf_name,
    placement.shelf_floor_id,
    placement.shelf_floor,
    placement.shelf_floor_limit`;

  const bookSource = `
    FROM book
    LEFT JOIN category ON category.category_id = book.category_id
    LEFT JOIN author ON author.author_id = book.author_id
    LEFT JOIN LATERAL (
      SELECT
        shelf_floor_book.shelf_floor_book_id,
        shelf.shelf_id,
        shelf.shelf_name,
        shelf_floor.shelf_floor_id,
        shelf_floor.shelf_floor,
        shelf_floor.shelf_floor_limit
      FROM shelf_floor_book
      JOIN shelf_floor ON shelf_floor.shelf_floor_id = shelf_floor_book.shelf_floor_id
      JOIN shelf ON shelf.shelf_id = shelf_floor.shelf_id
      WHERE shelf_floor_book.book_id = book.book_id
      ORDER BY shelf_floor_book.shelf_floor_book_id ASC
      LIMIT 1
    ) AS placement ON TRUE`;

  function createFilterClause({ authorId, bookType, categoryId, search, shelfStatus } = {}) {
    const clauses = [];
    const values = [];

    function addClause(sql, value) {
      values.push(value);
      clauses.push(sql.replace('?', `$${values.length}`));
    }

    if (shelfStatus === 'assigned') clauses.push('placement.shelf_floor_book_id IS NOT NULL');
    if (shelfStatus === 'unassigned') {
      clauses.push('placement.shelf_floor_book_id IS NULL');
      clauses.push("book.book_type = 'physical'");
    }
    if (bookType) addClause('book.book_type = ?', bookType);
    if (categoryId) addClause('book.category_id = ?', categoryId);
    if (authorId) addClause('book.author_id = ?', authorId);
    if (search) addClause('book.book_name ILIKE ?', `%${search}%`);

    return {
      values,
      whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    };
  }

  async function findBookPage({ filters, limit, offset }) {
    const { values, whereClause } = createFilterClause(filters);
    const limitPosition = values.length + 1;
    const offsetPosition = values.length + 2;
    const { rows } = await pool.query(
      `SELECT ${bookColumns}
       ${bookSource}
       ${whereClause}
       ORDER BY book.book_id ASC
       LIMIT $${limitPosition} OFFSET $${offsetPosition}`,
      [...values, limit, offset],
    );
    return rows;
  }

  async function countBooks(filters) {
    const { values, whereClause } = createFilterClause(filters);
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS total
       ${bookSource}
       ${whereClause}`,
      values,
    );
    return rows[0].total;
  }

  async function findCategories() {
    const { rows } = await pool.query(
      `SELECT category_id, category_name
       FROM category
       ORDER BY category_name ASC, category_id ASC`,
    );
    return rows;
  }

  async function findAuthors() {
    const { rows } = await pool.query(
      `SELECT author_id, author_name, author_pen_name
       FROM author
       ORDER BY author_name ASC, author_id ASC`,
    );
    return rows;
  }

  async function findShelvesWithFloors() {
    const { rows } = await pool.query(
      `SELECT
         shelf.shelf_id,
         shelf.shelf_name,
         shelf_floor.shelf_floor_id,
         shelf_floor.shelf_floor,
         shelf_floor.shelf_floor_limit,
         shelf_floor.category_id,
         category.category_name,
         COUNT(shelf_floor_book.shelf_floor_book_id)::INTEGER AS assigned_count
       FROM shelf
       JOIN shelf_floor ON shelf_floor.shelf_id = shelf.shelf_id
       LEFT JOIN category ON category.category_id = shelf_floor.category_id
       LEFT JOIN shelf_floor_book ON shelf_floor_book.shelf_floor_id = shelf_floor.shelf_floor_id
       GROUP BY
         shelf.shelf_id,
         shelf.shelf_name,
         shelf_floor.shelf_floor_id,
         shelf_floor.shelf_floor,
         shelf_floor.shelf_floor_limit,
         shelf_floor.category_id,
         category.category_name
       ORDER BY shelf.shelf_name ASC, shelf.shelf_id ASC, shelf_floor.shelf_floor ASC, shelf_floor.shelf_floor_id ASC`,
    );
    return rows;
  }

  async function findBookForAssignment(bookId) {
    const { rows } = await pool.query(
      `SELECT book_id, book_name, book_type
       FROM book
       WHERE book_id = $1
       LIMIT 1`,
      [bookId],
    );
    return rows[0];
  }

  async function findAssignmentByBookId(bookId) {
    const { rows } = await pool.query(
      `SELECT shelf_floor_book_id, shelf_floor_id, book_id
       FROM shelf_floor_book
       WHERE book_id = $1
       ORDER BY shelf_floor_book_id ASC
       LIMIT 1`,
      [bookId],
    );
    return rows[0];
  }

  async function findFloorForAssignment(shelfFloorId) {
    const { rows } = await pool.query(
      `SELECT
         shelf_floor.shelf_floor_id,
         shelf_floor.shelf_floor_limit,
         COUNT(shelf_floor_book.shelf_floor_book_id)::INTEGER AS assigned_count
       FROM shelf_floor
       LEFT JOIN shelf_floor_book ON shelf_floor_book.shelf_floor_id = shelf_floor.shelf_floor_id
       WHERE shelf_floor.shelf_floor_id = $1
       GROUP BY shelf_floor.shelf_floor_id, shelf_floor.shelf_floor_limit
       LIMIT 1`,
      [shelfFloorId],
    );
    return rows[0];
  }

  async function createAssignment({ bookId, shelfFloorId }) {
    const { rows } = await pool.query(
      `INSERT INTO shelf_floor_book (shelf_floor_id, book_id)
       VALUES ($1, $2)
       RETURNING shelf_floor_book_id, shelf_floor_id, book_id`,
      [shelfFloorId, bookId],
    );
    return rows[0];
  }

  return {
    countBooks,
    createAssignment,
    findAssignmentByBookId,
    findAuthors,
    findBookForAssignment,
    findBookPage,
    findCategories,
    findFloorForAssignment,
    findShelvesWithFloors,
  };
}

module.exports = { createBookArrangementModel };
