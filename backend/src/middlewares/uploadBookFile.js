const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const MAX_BOOK_FILE_SIZE = 50 * 1024 * 1024;
const BOOK_UPLOAD_URL_PREFIX = '/uploads/books/';
const COVER_UPLOAD_URL_PREFIX = '/uploads/covers/';
const DEFAULT_BOOK_FILE_DIRECTORY = path.join(__dirname, '..', '..', 'uploads', 'books');
const DEFAULT_COVER_DIRECTORY = path.join(__dirname, '..', '..', 'uploads', 'covers');
const BOOK_FILE_EXTENSIONS = new Set(['.epub', '.pdf']);
const BOOK_FILE_MIME_TYPES = new Set([
  'application/epub+zip',
  'application/octet-stream',
  'application/pdf',
]);
const COVER_IMAGE_EXTENSIONS = new Set(['.jpeg', '.jpg', '.png', '.webp']);
const COVER_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function createUploadError(message) {
  const error = new Error(message);
  error.expose = true;
  error.status = 400;
  return error;
}

function isSupportedBookFile(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  return BOOK_FILE_EXTENSIONS.has(extension) && BOOK_FILE_MIME_TYPES.has(file.mimetype);
}

function isSupportedCoverImage(file) {
  const extension = path.extname(file.originalname || '').toLowerCase();
  return COVER_IMAGE_EXTENSIONS.has(extension) && COVER_IMAGE_MIME_TYPES.has(file.mimetype);
}

function createBookFileUpload({
  bookCoverUploadDirectory = DEFAULT_COVER_DIRECTORY,
  bookUploadDirectory = DEFAULT_BOOK_FILE_DIRECTORY,
} = {}) {
  const resolvedBookUploadDirectory = path.resolve(bookUploadDirectory);
  const resolvedCoverUploadDirectory = path.resolve(bookCoverUploadDirectory);
  fs.mkdirSync(resolvedBookUploadDirectory, { recursive: true });
  fs.mkdirSync(resolvedCoverUploadDirectory, { recursive: true });

  const uploadDirectories = {
    bookFiles: resolvedBookUploadDirectory,
    covers: resolvedCoverUploadDirectory,
  };

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, file.fieldname === 'book_cover_image'
          ? resolvedCoverUploadDirectory
          : resolvedBookUploadDirectory);
      },
      filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${crypto.randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: MAX_BOOK_FILE_SIZE, files: 2 },
    fileFilter: (req, file, callback) => {
      if (file.fieldname === 'book_file' && isSupportedBookFile(file)) {
        callback(null, true);
        return;
      }
      if (file.fieldname === 'book_cover_image' && isSupportedCoverImage(file)) {
        callback(null, true);
        return;
      }
      if (file.fieldname === 'book_file') {
        callback(createUploadError('Book file must be a PDF or EPUB file.'));
        return;
      }
      callback(createUploadError('Book cover image must be a JPG, PNG, or WebP file.'));
    },
  });

  function handleUpload(req, res, next) {
    upload.fields([
      { name: 'book_file', maxCount: 1 },
      { name: 'book_cover_image', maxCount: 1 },
    ])(req, res, (error) => {
      if (error) {
        void discardUploadedBookFiles(req.files);
        return next(error);
      }

      const bookFile = req.files?.book_file?.[0];
      const coverImage = req.files?.book_cover_image?.[0];
      if (bookFile) req.body.book_file = `${BOOK_UPLOAD_URL_PREFIX}${bookFile.filename}`;
      if (coverImage) req.body.book_cover_image = `${COVER_UPLOAD_URL_PREFIX}${coverImage.filename}`;
      return next();
    });
  }

  function setUploadDirectories(req, res, next) {
    req.bookUploadDirectories = uploadDirectories;
    return next();
  }

  return {
    bookCoverUploadDirectory: resolvedCoverUploadDirectory,
    bookUploadDirectory: resolvedBookUploadDirectory,
    handleUpload,
    setUploadDirectories,
  };
}

async function discardUploadedBookFiles(files) {
  const allFiles = Array.isArray(files) ? files : Object.values(files || {}).flat();
  await Promise.all(allFiles
    .filter((file) => file?.path)
    .map((file) => fs.promises.unlink(file.path).catch(() => {})));
}

async function discardStoredBookUpload(uploadUrl, uploadDirectories) {
  if (typeof uploadUrl !== 'string' || !uploadDirectories) return;

  const uploadLocation = uploadUrl.startsWith(BOOK_UPLOAD_URL_PREFIX)
    ? { directory: uploadDirectories.bookFiles, prefix: BOOK_UPLOAD_URL_PREFIX }
    : uploadUrl.startsWith(COVER_UPLOAD_URL_PREFIX)
      ? { directory: uploadDirectories.covers, prefix: COVER_UPLOAD_URL_PREFIX }
      : null;
  if (!uploadLocation?.directory) return;

  let filename;
  try {
    filename = decodeURIComponent(uploadUrl.slice(uploadLocation.prefix.length));
  } catch {
    return;
  }

  if (!filename || path.basename(filename) !== filename) return;
  await fs.promises.unlink(path.join(uploadLocation.directory, filename)).catch(() => {});
}

module.exports = {
  createBookFileUpload,
  discardStoredBookUpload,
  discardUploadedBookFiles,
};
