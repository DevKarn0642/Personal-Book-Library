const MAX_BIGINT_ID = 9223372036854775807n;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validateAuthor(req, res, next) {
  const { author_name: authorName, author_pen_name: authorPenName } = req.body || {};

  if (typeof authorName !== 'string') {
    return res.status(400).json({ message: 'Author name must be a non-empty string with at most 255 characters.' });
  }

  const trimmedAuthorName = authorName.trim();
  if (trimmedAuthorName.length === 0 || trimmedAuthorName.length > 255) {
    return res.status(400).json({ message: 'Author name must be a non-empty string with at most 255 characters.' });
  }

  if (authorPenName !== undefined && authorPenName !== null && typeof authorPenName !== 'string') {
    return res.status(400).json({ message: 'Author pen name must be a string with at most 255 characters.' });
  }

  const trimmedAuthorPenName = typeof authorPenName === 'string' ? authorPenName.trim() : null;
  if (trimmedAuthorPenName && trimmedAuthorPenName.length > 255) {
    return res.status(400).json({ message: 'Author pen name must be a string with at most 255 characters.' });
  }

  req.authorInput = {
    authorName: trimmedAuthorName,
    authorPenName: trimmedAuthorPenName || null,
  };
  return next();
}

function validateAuthorId(req, res, next) {
  const { authorId } = req.params;

  if (typeof authorId !== 'string' || !/^[1-9]\d{0,18}$/.test(authorId) ||
      BigInt(authorId) > MAX_BIGINT_ID) {
    return res.status(400).json({ message: 'Author ID must be a positive integer.' });
  }

  req.authorId = authorId;
  return next();
}

function validateAuthorPagination(req, res, next) {
  const { page: pageValue, pageSize: pageSizeValue } = req.query;
  const page = parsePositiveInteger(pageValue, 1);
  const pageSize = parsePositiveInteger(pageSizeValue, DEFAULT_PAGE_SIZE);

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

module.exports = { validateAuthor, validateAuthorId, validateAuthorPagination };
