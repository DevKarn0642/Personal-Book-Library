const MAX_BIGINT_ID = 9223372036854775807n;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/;

function validatePositiveBigIntId(value, fieldName) {
  if (typeof value !== 'string' || !/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > MAX_BIGINT_ID) {
    return `${fieldName} must be a positive integer.`;
  }
  return undefined;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function isValidDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validateNullableString(value, fieldName, maxLength) {
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== 'string') {
    return { error: `${fieldName} must be a non-empty string with at most ${maxLength} characters.` };
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0 || trimmedValue.length > maxLength) {
    return { error: `${fieldName} must be a non-empty string with at most ${maxLength} characters.` };
  }
  return { value: trimmedValue };
}

function validateAlert(req, res, next) {
  const body = req.body || {};
  const {
    alert_repeat_type: alertRepeatType,
    alert_date: alertDate,
    alert_status: alertStatus,
    alert_time: alertTime,
    book_id: bookId,
  } = body;

  if (Object.hasOwn(body, 'user_id')) {
    return res.status(400).json({ message: 'User ID is supplied by authentication.' });
  }

  const validatedRepeatType = validateNullableString(alertRepeatType, 'Alert repeat type', 50);
  if (validatedRepeatType.error) {
    return res.status(400).json({ message: validatedRepeatType.error });
  }

  if (alertDate !== undefined && alertDate !== null &&
      (typeof alertDate !== 'string' || !isValidDate(alertDate))) {
    return res.status(400).json({ message: 'Alert date must be a valid date in YYYY-MM-DD format.' });
  }

  if (alertStatus !== undefined && typeof alertStatus !== 'boolean') {
    return res.status(400).json({ message: 'Alert status must be a boolean.' });
  }

  if (alertTime !== undefined && alertTime !== null &&
      (typeof alertTime !== 'string' || !TIME_PATTERN.test(alertTime))) {
    return res.status(400).json({ message: 'Alert time must be in HH:MM, HH:MM:SS, or HH:MM:SS.ssssss format.' });
  }

  if (bookId !== undefined && bookId !== null) {
    const bookIdError = validatePositiveBigIntId(bookId, 'Book ID');
    if (bookIdError) {
      return res.status(400).json({ message: bookIdError });
    }
  }

  req.alertInput = {
    alertRepeatType: validatedRepeatType.value,
    alertDate: alertDate ?? null,
    alertStatus: alertStatus ?? true,
    alertTime: alertTime ?? null,
    bookId: bookId ?? null,
  };
  return next();
}

function validateAlertId(req, res, next) {
  const alertIdError = validatePositiveBigIntId(req.params.alertId, 'Alert ID');
  if (alertIdError) {
    return res.status(400).json({ message: alertIdError });
  }

  req.alertId = req.params.alertId;
  return next();
}

function validateAlertPagination(req, res, next) {
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

module.exports = { validateAlert, validateAlertId, validateAlertPagination };
