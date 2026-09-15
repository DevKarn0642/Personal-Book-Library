const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');

const jwtSecret = 'test-secret-that-is-at-least-32-bytes-long';

async function startServer(t, pool, userId = '1') {
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const token = jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: userId });
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}/api/histories`,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('creates reading history for the authenticated user and validates input', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM book')) return { rows: [{ book_id: params[0] }] };
      if (sql.includes('INSERT INTO history')) {
        return {
          rows: [{
            history_id: '9',
            user_id: params[0],
            book_id: params[1],
            history_page: params[2],
            history_status: params[3],
            history_date_at: '2026-09-15T01:00:00.000Z',
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12', history_page: 84, history_status: '  reading  ' }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    history: {
      history_id: '9',
      user_id: '1',
      book_id: '12',
      history_page: 84,
      history_status: 'reading',
      history_date_at: '2026-09-15T01:00:00.000Z',
    },
  });
  assert.deepEqual(queries[0].params, ['12']);
  assert.deepEqual(queries[1].params, ['1', '12', 84, 'reading']);

  const invalid = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12', history_page: -1 }),
  });
  assert.equal(invalid.status, 400);

  const suppliedUser = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12', user_id: '2' }),
  });
  assert.equal(suppliedUser.status, 400);

  const anonymous = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12' }),
  });
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 2);
});

test('lists only the current user reading history with pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) return { rows: [{ total: '11' }] };
      if (sql.includes('ORDER BY history_date_at DESC')) {
        return {
          rows: [{
            history_id: '9',
            user_id: params[0],
            book_id: '12',
            history_page: 84,
            history_status: 'reading',
            history_date_at: '2026-09-15T01:00:00.000Z',
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool, '7');

  const response = await fetch(`${baseUrl}?page=2&pageSize=5`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    histories: [{
      history_id: '9',
      user_id: '7',
      book_id: '12',
      history_page: 84,
      history_status: 'reading',
      history_date_at: '2026-09-15T01:00:00.000Z',
    }],
    pagination: { page: 2, pageSize: 5, total: 11, totalPages: 3 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('ORDER BY history_date_at DESC')).params,
    ['7', 5, 5],
  );
  assert.deepEqual(
    queries.find(query => query.sql.includes('COUNT(*) AS total')).params,
    ['7'],
  );

  const invalid = await fetch(`${baseUrl}?pageSize=101`, { headers });
  assert.equal(invalid.status, 400);
});

test('gets, updates, and deletes only reading history owned by the authenticated user', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('SELECT history_id')) {
        return {
          rows: [{
            history_id: params[0],
            user_id: params[1],
            book_id: '12',
            history_page: 84,
            history_status: 'reading',
            history_date_at: '2026-09-15T01:00:00.000Z',
          }],
        };
      }
      if (sql.includes('FROM book')) return { rows: [{ book_id: params[0] }] };
      if (sql.includes('UPDATE history')) {
        return {
          rows: [{
            history_id: params[3],
            user_id: params[4],
            book_id: params[0],
            history_page: params[1],
            history_status: params[2],
            history_date_at: '2026-09-15T01:00:00.000Z',
          }],
        };
      }
      if (sql.includes('DELETE FROM history')) return { rows: [{ history_id: params[0], user_id: params[1] }] };
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool, '7');

  const found = await fetch(`${baseUrl}/9`, { headers });
  assert.equal(found.status, 200);
  assert.equal((await found.json()).history.user_id, '7');
  assert.deepEqual(queries[0].params, ['9', '7']);

  const updated = await fetch(`${baseUrl}/9`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '14', history_page: 120, history_status: 'completed' }),
  });
  assert.equal(updated.status, 200);
  assert.deepEqual((await updated.json()).history, {
    history_id: '9',
    user_id: '7',
    book_id: '14',
    history_page: 120,
    history_status: 'completed',
    history_date_at: '2026-09-15T01:00:00.000Z',
  });
  assert.deepEqual(queries[1].params, ['9', '7']);
  assert.deepEqual(queries[2].params, ['14']);
  assert.deepEqual(queries[3].params, ['14', 120, 'completed', '9', '7']);

  const deleted = await fetch(`${baseUrl}/9`, { method: 'DELETE', headers });
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { success: true });
  assert.deepEqual(queries[4].params, ['9', '7']);
});

test('returns not found for missing books or history and handles database failures safely', async (t) => {
  const missingPool = { async query() { return { rows: [] }; } };
  const missingServer = await startServer(t, missingPool);

  const missingBook = await fetch(missingServer.baseUrl, {
    method: 'POST',
    headers: { ...missingServer.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '999' }),
  });
  assert.equal(missingBook.status, 404);
  assert.deepEqual(await missingBook.json(), { message: 'Book not found.' });

  const missingHistory = await fetch(`${missingServer.baseUrl}/999`, { headers: missingServer.headers });
  assert.equal(missingHistory.status, 404);
  assert.deepEqual(await missingHistory.json(), { message: 'Reading history not found.' });

  const failedPool = { async query() { throw new Error('database unavailable'); } };
  const failedServer = await startServer(t, failedPool);
  const failed = await fetch(failedServer.baseUrl, {
    method: 'POST',
    headers: { ...failedServer.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: '12' }),
  });
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { message: 'Internal server error.' });
});
