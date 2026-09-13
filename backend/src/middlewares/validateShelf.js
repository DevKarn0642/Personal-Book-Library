const MAX_BIGINT_ID = 9223372036854775807n;
const MAX_INTEGER = 2147483647;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validateOptionalText(value, fieldName) {
  if (value === undefined || value === null) return { value: null };

  if (typeof value !== 'string') {
    return { error: `${fieldName} must be a string with at most 100 characters.` };
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length > 100) {
    return { error: `${fieldName} must be a string with at most 100 characters.` };
  }

  return { value: trimmedValue || null };
}

function validateShelf(req, res, next) {
  const {
    shelf_name: shelfName,
    shelf_limit: shelfLimit,
    shelf_color: shelfColor,
    shelf_material: shelfMaterial,
  } = req.body || {};

  if (typeof shelfName !== 'string') {
    return res.status(400).json({ message: 'Shelf name must be a non-empty string with at most 255 characters.' });
  }

  const trimmedShelfName = shelfName.trim();
  if (trimmedShelfName.length === 0 || trimmedShelfName.length > 255) {
    return res.status(400).json({ message: 'Shelf name must be a non-empty string with at most 255 characters.' });
  }

  if (shelfLimit !== undefined && shelfLimit !== null &&
      (!Number.isInteger(shelfLimit) || shelfLimit < 0 || shelfLimit > MAX_INTEGER)) {
    return res.status(400).json({ message: 'Shelf limit must be a whole number between 0 and 2147483647.' });
  }

  const validatedColor = validateOptionalText(shelfColor, 'Shelf color');
  if (validatedColor.error) {
    return res.status(400).json({ message: validatedColor.error });
  }

  const validatedMaterial = validateOptionalText(shelfMaterial, 'Shelf material');
  if (validatedMaterial.error) {
    return res.status(400).json({ message: validatedMaterial.error });
  }

  req.shelfInput = {
    shelfName: trimmedShelfName,
    shelfLimit: shelfLimit ?? null,
    shelfColor: validatedColor.value,
    shelfMaterial: validatedMaterial.value,
  };
  return next();
}

function validateShelfId(req, res, next) {
  const { shelfId } = req.params;

  if (typeof shelfId !== 'string' || !/^[1-9]\d{0,18}$/.test(shelfId) ||
      BigInt(shelfId) > MAX_BIGINT_ID) {
    return res.status(400).json({ message: 'Shelf ID must be a positive integer.' });
  }

  req.shelfId = shelfId;
  return next();
}

function validateShelfPagination(req, res, next) {
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

module.exports = { validateShelf, validateShelfId, validateShelfPagination };
