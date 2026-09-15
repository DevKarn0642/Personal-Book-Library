const MAX_BIGINT_ID = 9223372036854775807n;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const BOOK_TYPES = new Set(['file', 'physical']);
const SHELF_STATUSES = new Set(['all', 'assigned', 'unassigned']);

function validateBigIntId(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) return { error: `${fieldName} is required.` };
    return { value: null };
  }

  if (typeof value !== 'string' || !/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > MAX_BIGINT_ID) {
    return { error: `${fieldName} must be a positive integer.` };
  }

  return { value };
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validateBookArrangementPagination(req, res, next) {
  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, DEFAULT_PAGE_SIZE);
  if (page === undefined || pageSize === undefined || pageSize > MAX_PAGE_SIZE) {
    return res.status(400).json({ message: 'page must be a positive integer and pageSize must be between 1 and 100.' });
  }

  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({ message: 'Requested page is too large.' });
  }

  const shelfStatus = req.query.shelfStatus || 'all';
  if (typeof shelfStatus !== 'string' || !SHELF_STATUSES.has(shelfStatus)) {
    return res.status(400).json({ message: 'shelfStatus must be all, assigned, or unassigned.' });
  }

  const bookType = req.query.bookType;
  if (bookType !== undefined && (typeof bookType !== 'string' || !BOOK_TYPES.has(bookType))) {
    return res.status(400).json({ message: 'bookType must be physical or file.' });
  }

  const search = req.query.search;
  if (search !== undefined && (typeof search !== 'string' || search.trim().length > 255)) {
    return res.status(400).json({ message: 'search must be a string with at most 255 characters.' });
  }

  const categoryId = validateBigIntId(req.query.categoryId, 'Category ID');
  if (categoryId.error) return res.status(400).json({ message: categoryId.error });

  const authorId = validateBigIntId(req.query.authorId, 'Author ID');
  if (authorId.error) return res.status(400).json({ message: authorId.error });

  req.pagination = { page, pageSize, offset };
  req.bookArrangementFilters = {
    authorId: authorId.value,
    bookType: bookType || null,
    categoryId: categoryId.value,
    search: search?.trim() || null,
    shelfStatus,
  };
  return next();
}

function validateBookArrangementAssignment(req, res, next) {
  const { book_id: bookId, shelf_floor_id: shelfFloorId } = req.body || {};
  const validatedBookId = validateBigIntId(bookId, 'Book ID', { required: true });
  if (validatedBookId.error) return res.status(400).json({ message: validatedBookId.error });

  const validatedShelfFloorId = validateBigIntId(shelfFloorId, 'Shelf floor ID', { required: true });
  if (validatedShelfFloorId.error) return res.status(400).json({ message: validatedShelfFloorId.error });

  req.bookArrangementAssignment = {
    bookId: validatedBookId.value,
    shelfFloorId: validatedShelfFloorId.value,
  };
  return next();
}

module.exports = { validateBookArrangementAssignment, validateBookArrangementPagination };
