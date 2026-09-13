const MAX_BIGINT_ID = 9223372036854775807n;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validateCategory(req, res, next) {
  const { category_name: categoryName } = req.body || {};

  if (typeof categoryName !== 'string') {
    return res.status(400).json({ message: 'Category name must be a non-empty string with at most 100 characters.' });
  }

  const trimmedCategoryName = categoryName.trim();
  if (trimmedCategoryName.length === 0 || trimmedCategoryName.length > 100) {
    return res.status(400).json({ message: 'Category name must be a non-empty string with at most 100 characters.' });
  }

  req.categoryInput = { categoryName: trimmedCategoryName };
  return next();
}

function validateCategoryId(req, res, next) {
  const { categoryId } = req.params;

  if (typeof categoryId !== 'string' || !/^[1-9]\d{0,18}$/.test(categoryId) ||
      BigInt(categoryId) > MAX_BIGINT_ID) {
    return res.status(400).json({ message: 'Category ID must be a positive integer.' });
  }

  req.categoryId = categoryId;
  return next();
}

function validateCategoryPagination(req, res, next) {
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

module.exports = { validateCategory, validateCategoryId, validateCategoryPagination };
