const MAX_BIGINT_ID = 9223372036854775807n;
const MAX_INTEGER = 2147483647;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const { discardUploadedBookFiles } = require('./uploadBookFile');
const BOOK_TYPES = new Set(['file', 'physical']);

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

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function parseOptionalNonNegativeInteger(value) {
  if (value === undefined || value === null || value === '') return { value: null };

  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= MAX_INTEGER) return { value };
    return { error: 'Book total pages must be a whole number between 0 and 2147483647.' };
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return { error: 'Book total pages must be a whole number between 0 and 2147483647.' };
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > MAX_INTEGER) {
    return { error: 'Book total pages must be a whole number between 0 and 2147483647.' };
  }
  return { value: parsed };
}

function sendValidationError(req, res, message) {
  void discardUploadedBookFiles(req.files);
  return res.status(400).json({ message });
}

function validateBook(req, res, next) {
  const body = req.body || {};
  const {
    category_id: categoryId,
    author_id: authorId,
    book_type: bookType,
    book_name: bookName,
    book_date: bookDate,
    book_totalpage: bookTotalPage,
    book_file: bookFile,
    book_cover_image: bookCoverImage,
  } = body;

  if (Object.hasOwn(body, 'book_id')) {
    return sendValidationError(req, res, 'Book ID is supplied by the URL.');
  }

  if (typeof bookName !== 'string' || bookName.trim().length === 0 || bookName.trim().length > 255) {
    return sendValidationError(req, res, 'Book name must be a non-empty string with at most 255 characters.');
  }

  if (typeof bookType !== 'string' || !BOOK_TYPES.has(bookType)) {
    return sendValidationError(req, res, 'Book type must be physical or file.');
  }

  if (bookDate !== undefined && bookDate !== null && !isIsoDate(bookDate)) {
    return sendValidationError(req, res, 'Book date must be an ISO date in YYYY-MM-DD format.');
  }

  const validatedBookTotalPage = parseOptionalNonNegativeInteger(bookTotalPage);
  if (validatedBookTotalPage.error) {
    return sendValidationError(req, res, validatedBookTotalPage.error);
  }

  if (bookFile !== undefined && bookFile !== null &&
      (typeof bookFile !== 'string' || bookFile.trim().length === 0)) {
    return sendValidationError(req, res, 'Book file must be a non-empty string or null.');
  }

  if (bookType === 'file' && (typeof bookFile !== 'string' || bookFile.trim().length === 0)) {
    return sendValidationError(req, res, 'A book file is required when book type is file.');
  }

  if (bookType === 'physical' && bookFile !== undefined && bookFile !== null) {
    return sendValidationError(req, res, 'A physical book cannot include a book file.');
  }

  if (bookCoverImage !== undefined && bookCoverImage !== null &&
      (typeof bookCoverImage !== 'string' || bookCoverImage.trim().length === 0)) {
    return sendValidationError(req, res, 'Book cover image must be a non-empty string or null.');
  }

  const validatedCategoryId = validateBigIntId(categoryId, 'Category ID');
  if (validatedCategoryId.error) return sendValidationError(req, res, validatedCategoryId.error);

  const validatedAuthorId = validateBigIntId(authorId, 'Author ID');
  if (validatedAuthorId.error) return sendValidationError(req, res, validatedAuthorId.error);

  req.bookInput = {
    categoryId: validatedCategoryId.value,
    authorId: validatedAuthorId.value,
    bookType,
    bookName: bookName.trim(),
    bookDate: bookDate ?? null,
    bookTotalPage: validatedBookTotalPage.value,
    bookFile: bookType === 'file' ? bookFile.trim() : null,
    bookCoverImage: typeof bookCoverImage === 'string' ? bookCoverImage.trim() : null,
  };
  return next();
}

function validateBookId(req, res, next) {
  const validatedBookId = validateBigIntId(req.params.bookId, 'Book ID', { required: true });
  if (validatedBookId.error) {
    return res.status(400).json({ message: validatedBookId.error });
  }

  req.bookId = validatedBookId.value;
  return next();
}

function validateBookPagination(req, res, next) {
  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, DEFAULT_PAGE_SIZE);

  if (page === undefined || pageSize === undefined || pageSize > MAX_PAGE_SIZE) {
    return res.status(400).json({ message: 'page must be a positive integer and pageSize must be between 1 and 100.' });
  }

  const offset = (page - 1) * pageSize;
  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({ message: 'Requested page is too large.' });
  }

  req.pagination = { page, pageSize, offset };
  return next();
}

module.exports = { validateBook, validateBookId, validateBookPagination };
