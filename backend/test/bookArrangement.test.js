const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');

const jwtSecret = 'test-secret-that-is-at-least-32-bytes-long';

async function startServer(t, pool) {
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const token = jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: '1' });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}/api/book-arrangements`,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('lists books for arrangement with all requested filters', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) return { rows: [{ total: '1' }] };
      if (sql.includes('ORDER BY book.book_id ASC')) {
        return {
          rows: [{
            book_id: '12', book_name: 'Filtered physical book', book_type: 'physical', book_totalpage: 200,
            category_id: '3', category_name: 'Novel', author_id: '7', author_name: 'Author', author_pen_name: null,
            shelf_floor_book_id: null, shelf_id: null, shelf_name: null, shelf_floor_id: null,
            shelf_floor: null, shelf_floor_limit: null,
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(
    `${baseUrl}/books?shelfStatus=unassigned&bookType=physical&categoryId=3&authorId=7&search=filtered`,
    { headers },
  );

  assert.equal(response.status, 200);
  assert.equal((await response.json()).pagination.total, 1);
  const listQuery = queries.find(query => query.sql.includes('ORDER BY book.book_id ASC'));
  assert.match(listQuery.sql, /placement\.shelf_floor_book_id IS NULL/);
  assert.match(listQuery.sql, /book\.book_name ILIKE \$4/);
  assert.deepEqual(listQuery.params, ['physical', '3', '7', '%filtered%', 10, 0]);

  const invalid = await fetch(`${baseUrl}/books?shelfStatus=unknown`, { headers });
  assert.equal(invalid.status, 400);

  const anonymous = await fetch(`${baseUrl}/books`);
  assert.equal(anonymous.status, 401);
});

test('assigns one physical book to a shelf floor with available capacity', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM book') && sql.includes('WHERE book_id = $1')) {
        return { rows: [{ book_id: params[0], book_name: 'Physical', book_type: 'physical' }] };
      }
      if (sql.includes('FROM shelf_floor_book') && sql.includes('WHERE book_id = $1')) {
        return { rows: [] };
      }
      if (sql.includes('FROM shelf_floor') && sql.includes('COUNT(shelf_floor_book.shelf_floor_book_id)')) {
        return { rows: [{ shelf_floor_id: params[0], shelf_floor_limit: 3, assigned_count: 2 }] };
      }
      if (sql.includes('INSERT INTO shelf_floor_book')) {
        return { rows: [{ shelf_floor_book_id: '31', shelf_floor_id: params[0], book_id: params[1] }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/assignments`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12', shelf_floor_id: '8' }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    assignment: { shelf_floor_book_id: '31', shelf_floor_id: '8', book_id: '12' },
  });
  assert.deepEqual(queries.find(query => query.sql.includes('INSERT INTO shelf_floor_book')).params, ['8', '12']);
});

test('rejects file books, already assigned books, and full shelf floors', async (t) => {
  const cases = [
    {
      book: { book_id: '12', book_type: 'file' },
      expectedMessage: 'Only physical books can be placed on a shelf.',
      expectedStatus: 400,
    },
    {
      assignment: { shelf_floor_book_id: '44', shelf_floor_id: '7', book_id: '12' },
      book: { book_id: '12', book_type: 'physical' },
      expectedMessage: 'This book is already assigned to a shelf floor.',
      expectedStatus: 409,
    },
    {
      book: { book_id: '12', book_type: 'physical' },
      floor: { shelf_floor_id: '8', shelf_floor_limit: 2, assigned_count: 2 },
      expectedMessage: 'This shelf floor has reached its capacity.',
      expectedStatus: 409,
    },
  ];

  for (const currentCase of cases) {
    const pool = {
      async query(sql) {
        if (sql.includes('FROM book') && sql.includes('WHERE book_id = $1')) {
          return { rows: currentCase.book ? [currentCase.book] : [] };
        }
        if (sql.includes('FROM shelf_floor_book') && sql.includes('WHERE book_id = $1')) {
          return { rows: currentCase.assignment ? [currentCase.assignment] : [] };
        }
        if (sql.includes('FROM shelf_floor') && sql.includes('COUNT(shelf_floor_book.shelf_floor_book_id)')) {
          return { rows: currentCase.floor ? [currentCase.floor] : [] };
        }
        throw new Error(`Unexpected query: ${sql}`);
      },
    };
    const { baseUrl, headers } = await startServer(t, pool);
    const response = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: '12', shelf_floor_id: '8' }),
    });

    assert.equal(response.status, currentCase.expectedStatus);
    assert.deepEqual(await response.json(), { message: currentCase.expectedMessage });
  }
});

test('returns not found and safe server errors for book arrangement assignments', async (t) => {
  const missingPool = {
    async query() {
      return { rows: [] };
    },
  };
  const missingServer = await startServer(t, missingPool);
  const missing = await fetch(`${missingServer.baseUrl}/assignments`, {
    method: 'POST',
    headers: { ...missingServer.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12', shelf_floor_id: '8' }),
  });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'Book not found.' });

  const errorPool = { async query() { throw new Error('database unavailable'); } };
  const errorServer = await startServer(t, errorPool);
  const failed = await fetch(`${errorServer.baseUrl}/books`, { headers: errorServer.headers });
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { message: 'Internal server error.' });
});
