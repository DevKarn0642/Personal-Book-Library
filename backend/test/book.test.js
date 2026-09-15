const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const jwt = require('jsonwebtoken');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../app');

const jwtSecret = 'test-secret-that-is-at-least-32-bytes-long';

async function startServer(t, pool) {
  const bookUploadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'book-library-files-'));
  const bookCoverUploadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'book-library-covers-'));
  t.after(() => fs.rm(bookUploadDirectory, { force: true, recursive: true }));
  t.after(() => fs.rm(bookCoverUploadDirectory, { force: true, recursive: true }));

  const server = createApp({
    pool,
    jwtSecret,
    bookCoverUploadDirectory,
    bookUploadDirectory,
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const token = jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: '1' });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}/api/books`,
    bookCoverUploadDirectory,
    bookUploadDirectory,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('creates a physical book and requires the new book type', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('INSERT INTO book')) {
        return {
          rows: [{
            book_id: '24',
            category_id: params[0],
            author_id: params[1],
            book_type: params[2],
            book_name: params[3],
            book_date: params[4],
            book_totalpage: params[5],
            book_file: params[6],
            book_cover_image: params[7],
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const success = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category_id: '4',
      author_id: '2',
      book_type: 'physical',
      book_name: '  A Wizard of Earthsea  ',
      book_date: '1968-09-01',
      book_totalpage: 205,
    }),
  });

  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), {
    book: {
      book_id: '24',
      category_id: '4',
      author_id: '2',
      book_type: 'physical',
      book_name: 'A Wizard of Earthsea',
      book_date: '1968-09-01',
      book_totalpage: 205,
      book_file: null,
      book_cover_image: null,
    },
  });
  assert.deepEqual(queries[0].params, ['4', '2', 'physical', 'A Wizard of Earthsea', '1968-09-01', 205, null, null]);

  const invalid = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_name: 'Missing type' }),
  });
  assert.equal(invalid.status, 400);
  assert.equal(queries.length, 1);

  const anonymous = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_name: 'Anonymous', book_type: 'physical' }),
  });
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 1);
});

test('uploads an e-book and cover image and serves both only to authenticated users', async (t) => {
  const pool = {
    async query(sql, params) {
      if (sql.includes('INSERT INTO book')) {
        return {
          rows: [{
            book_id: '25', category_id: null, author_id: null, book_type: params[2],
            book_name: params[3], book_date: null, book_totalpage: params[5],
            book_file: params[6], book_cover_image: params[7],
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, bookCoverUploadDirectory, bookUploadDirectory, headers } = await startServer(t, pool);
  const formData = new FormData();
  formData.append('book_name', 'Uploaded book');
  formData.append('book_type', 'file');
  formData.append('book_totalpage', '10');
  formData.append('book_file', new Blob(['sample PDF content'], { type: 'application/pdf' }), 'sample-book.pdf');
  formData.append('book_cover_image', new Blob(['sample PNG content'], { type: 'image/png' }), 'sample-cover.png');

  const response = await fetch(baseUrl, { method: 'POST', headers, body: formData });

  assert.equal(response.status, 201);
  const { book } = await response.json();
  assert.match(book.book_file, /^\/uploads\/books\/[\w-]+\.pdf$/);
  assert.match(book.book_cover_image, /^\/uploads\/covers\/[\w-]+\.png$/);

  const bookFileName = book.book_file.slice('/uploads/books/'.length);
  const coverFileName = book.book_cover_image.slice('/uploads/covers/'.length);
  assert.equal(await fs.readFile(path.join(bookUploadDirectory, bookFileName), 'utf8'), 'sample PDF content');
  assert.equal(await fs.readFile(path.join(bookCoverUploadDirectory, coverFileName), 'utf8'), 'sample PNG content');

  const bookDownloadUrl = baseUrl.replace('/api/books', book.book_file);
  const coverDownloadUrl = baseUrl.replace('/api/books', book.book_cover_image);
  assert.equal((await fetch(bookDownloadUrl, { headers })).status, 200);
  const coverDownloadResponse = await fetch(coverDownloadUrl, { headers });
  assert.equal(coverDownloadResponse.status, 200);
  assert.equal(coverDownloadResponse.headers.get('cross-origin-resource-policy'), 'cross-origin');
  assert.equal((await fetch(coverDownloadUrl)).status, 401);
});

test('rejects unsupported uploads and file books without an e-book file', async (t) => {
  let queried = false;
  const pool = { async query() { queried = true; return { rows: [] }; } };
  const { baseUrl, headers } = await startServer(t, pool);
  const unsupportedCover = new FormData();
  unsupportedCover.append('book_name', 'Unsupported cover');
  unsupportedCover.append('book_type', 'physical');
  unsupportedCover.append('book_cover_image', new Blob(['not an image'], { type: 'text/plain' }), 'cover.txt');

  const unsupportedResponse = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: unsupportedCover,
  });
  assert.equal(unsupportedResponse.status, 400);
  assert.deepEqual(await unsupportedResponse.json(), { message: 'Book cover image must be a JPG, PNG, or WebP file.' });

  const missingFile = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_name: 'Missing e-book', book_type: 'file' }),
  });
  assert.equal(missingFile.status, 400);
  assert.equal(queried, false);
});

test('lists books with server-side pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) return { rows: [{ total: '21' }] };
      if (sql.includes('LIMIT $1 OFFSET $2')) {
        return { rows: [{
          book_id: '11', category_id: null, author_id: '2', book_type: 'physical',
          book_name: 'Kindred', book_date: '1979-06-01', book_totalpage: 288,
          book_file: null, book_cover_image: '/uploads/covers/kindred.png',
        }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}?page=2&pageSize=10`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    books: [{
      book_id: '11', category_id: null, author_id: '2', book_type: 'physical',
      book_name: 'Kindred', book_date: '1979-06-01', book_totalpage: 288,
      book_file: null, book_cover_image: '/uploads/covers/kindred.png',
    }],
    pagination: { page: 2, pageSize: 10, total: 21, totalPages: 3 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('LIMIT $1 OFFSET $2')).params,
    [10, 10],
  );

  const invalid = await fetch(`${baseUrl}?page=0`, { headers });
  assert.equal(invalid.status, 400);

  const anonymous = await fetch(baseUrl);
  assert.equal(anonymous.status, 401);
});

test('filters books by type, category, author, title, and shelf', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) return { rows: [{ total: '1' }] };
      if (sql.includes('LIMIT $6 OFFSET $7')) {
        return { rows: [{
          book_id: '12', category_id: '3', author_id: '7', book_type: 'file',
          book_name: 'The Filtered Book', book_date: null, book_totalpage: null,
          book_file: '/uploads/books/filtered.pdf', book_cover_image: null,
        }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(
    `${baseUrl}?bookType=file&categoryId=3&authorId=7&search=filtered&shelfId=4`,
    { headers },
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).pagination.total, 1);
  const listQuery = queries.find(query => query.sql.includes('LIMIT $6 OFFSET $7'));
  assert.match(listQuery.sql, /book_name ILIKE \$4/);
  assert.match(listQuery.sql, /shelf_floor\.shelf_id = \$5/);
  assert.deepEqual(listQuery.params, ['file', '3', '7', '%filtered%', '4', 10, 0]);

  const invalid = await fetch(`${baseUrl}?bookType=audio`, { headers });
  assert.equal(invalid.status, 400);
});

test('gets, updates, and deletes books with cover metadata', async (t) => {
  const pool = {
    async query(sql, params) {
      if (sql.includes('SELECT book_id')) {
        return { rows: [{
          book_id: params[0], category_id: null, author_id: null, book_type: 'physical',
          book_name: 'Found', book_date: null, book_totalpage: null,
          book_file: null, book_cover_image: null,
          shelf_locations: [{
            shelf_id: '4', shelf_name: 'ชั้น B — ความรู้',
            shelf_floor_id: '8', shelf_floor: 2,
          }],
        }] };
      }
      if (sql.includes('UPDATE book')) {
        return { rows: [{
          book_id: params[8], category_id: params[0], author_id: params[1], book_type: params[2],
          book_name: params[3], book_date: params[4], book_totalpage: params[5],
          book_file: params[6], book_cover_image: params[7],
        }] };
      }
      if (sql.includes('DELETE FROM book')) return { rows: [{ book_id: params[0] }] };
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const found = await fetch(`${baseUrl}/21`, { headers });
  assert.equal(found.status, 200);
  const foundBody = await found.json();
  assert.equal(foundBody.book.book_id, '21');
  assert.deepEqual(foundBody.book.shelf_locations, [{
    shelf_id: '4', shelf_name: 'ชั้น B — ความรู้',
    shelf_floor_id: '8', shelf_floor: 2,
  }]);

  const updated = await fetch(`${baseUrl}/21`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_name: 'Updated', book_totalpage: 100, book_type: 'physical' }),
  });
  assert.equal(updated.status, 200);
  assert.deepEqual((await updated.json()).book, {
    book_id: '21', category_id: null, author_id: null, book_type: 'physical',
    book_name: 'Updated', book_date: null, book_totalpage: 100,
    book_file: null, book_cover_image: null,
  });

  const deleted = await fetch(`${baseUrl}/21`, { method: 'DELETE', headers });
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { success: true });

  const emptyPool = { async query() { return { rows: [] }; } };
  const missingServer = await startServer(t, emptyPool);
  const missing = await fetch(`${missingServer.baseUrl}/999`, { headers: missingServer.headers });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'Book not found.' });

  const invalidId = await fetch(`${baseUrl}/0`, { headers });
  assert.equal(invalidId.status, 400);
});

test('returns a safe error when the database fails', async (t) => {
  const pool = { async query() { throw new Error('database unavailable'); } };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_name: 'The Fifth Season', book_type: 'physical' }),
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Internal server error.' });
});
