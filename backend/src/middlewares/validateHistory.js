const MAX_BIGINT_ID = 9223372036854775807n;
const MAX_INTEGER = 2147483647;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function validatePositiveBigIntId(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) return { error: `${fieldName} is required.` };
    return { value: null };
  }

  if (typeof value !== 'string' || !/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > MAX_BIGINT_ID) {
    return { error: `${fieldName} must be a positive integer.` };
  }
  return { value };
}

function parseNonNegativeInteger(value, fieldName, { fallback } = {}) {
  if (value === undefined || value === null) return { value: fallback };

  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_INTEGER) {
    return { value };
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed) && parsed <= MAX_INTEGER) return { value: parsed };
  }

  return { error: `${fieldName} must be a whole number between 0 and 2147483647.` };
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validateHistoryStatus(value) {
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== 'string') {
    return { error: 'History status must be a non-empty string with at most 50 characters.' };
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0 || trimmedValue.length > 50) {
    return { error: 'History status must be a non-empty string with at most 50 characters.' };
  }
  return { value: trimmedValue };
}

function validateHistory(req, res, next) {
  const body = req.body || {};
  const { book_id: bookId, history_page: historyPage, history_status: historyStatus } = body;

  if (Object.hasOwn(body, 'history_id')) {
    return res.status(400).json({ message: 'History ID is supplied by the URL.' });
  }
  if (Object.hasOwn(body, 'user_id')) {
    return res.status(400).json({ message: 'User ID is supplied by authentication.' });
  }
  if (Object.hasOwn(body, 'history_date_at')) {
    return res.status(400).json({ message: 'History date is assigned automatically.' });
  }

  const validatedBookId = validatePositiveBigIntId(bookId, 'Book ID', { required: true });
  if (validatedBookId.error) return res.status(400).json({ message: validatedBookId.error });

  const validatedHistoryPage = parseNonNegativeInteger(historyPage, 'History page', { fallback: 0 });
  if (validatedHistoryPage.error) return res.status(400).json({ message: validatedHistoryPage.error });

  const validatedHistoryStatus = validateHistoryStatus(historyStatus);
  if (validatedHistoryStatus.error) return res.status(400).json({ message: validatedHistoryStatus.error });

  req.historyInput = {
    bookId: validatedBookId.value,
    historyPage: validatedHistoryPage.value,
    historyStatus: validatedHistoryStatus.value,
  };
  return next();
}

function validateHistoryId(req, res, next) {
  const validatedHistoryId = validatePositiveBigIntId(req.params.historyId, 'History ID', { required: true });
  if (validatedHistoryId.error) {
    return res.status(400).json({ message: validatedHistoryId.error });
  }

  req.historyId = validatedHistoryId.value;
  return next();
}

function validateHistoryPagination(req, res, next) {
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

module.exports = { validateHistory, validateHistoryId, validateHistoryPagination };
