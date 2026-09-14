const MAX_BIGINT_ID = 9223372036854775807n;
const MAX_INTEGER = 2147483647;

function validateBigIntId(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      return { error: `${fieldName} is required.` };
    }
    return { value: null };
  }

  if (typeof value !== 'string' || !/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > MAX_BIGINT_ID) {
    return { error: `${fieldName} must be a positive integer.` };
  }

  return { value };
}

function validateShelfFloor(req, res, next) {
  const {
    shelf_floor_limit: shelfFloorLimit,
    shelf_floor: shelfFloor,
    book_id: bookId,
    category_id: categoryId,
  } = req.body || {};

  if (Object.hasOwn(req.body || {}, 'shelf_id')) {
    return res.status(400).json({ message: 'Shelf ID is supplied by the URL.' });
  }

  if (!Number.isInteger(shelfFloor) || shelfFloor < 1 || shelfFloor > MAX_INTEGER) {
    return res.status(400).json({ message: 'Shelf floor must be a whole number between 1 and 2147483647.' });
  }

  if (shelfFloorLimit !== undefined && shelfFloorLimit !== null &&
      (!Number.isInteger(shelfFloorLimit) || shelfFloorLimit < 0 || shelfFloorLimit > MAX_INTEGER)) {
    return res.status(400).json({ message: 'Shelf floor limit must be a whole number between 0 and 2147483647.' });
  }

  const validatedBookId = validateBigIntId(bookId, 'Book ID');
  if (validatedBookId.error) {
    return res.status(400).json({ message: validatedBookId.error });
  }

  const validatedCategoryId = validateBigIntId(categoryId, 'Category ID');
  if (validatedCategoryId.error) {
    return res.status(400).json({ message: validatedCategoryId.error });
  }

  req.shelfFloorInput = {
    shelfId: req.shelfId,
    shelfFloorLimit: shelfFloorLimit ?? null,
    shelfFloor,
    bookId: validatedBookId.value,
    categoryId: validatedCategoryId.value,
  };
  return next();
}

function validateShelfFloorId(req, res, next) {
  const { shelfFloorId } = req.params;
  const validatedShelfFloorId = validateBigIntId(shelfFloorId, 'Shelf floor ID', { required: true });

  if (validatedShelfFloorId.error) {
    return res.status(400).json({ message: validatedShelfFloorId.error });
  }

  req.shelfFloorId = validatedShelfFloorId.value;
  return next();
}

module.exports = { validateShelfFloor, validateShelfFloorId };
