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
    baseUrl: `http://127.0.0.1:${server.address().port}/api/authors`,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('creates an author, normalizes its names, and rejects invalid or anonymous requests', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('INSERT INTO author')) {
        return {
          rows: [{
            author_id: '8',
            author_name: params[0],
            author_pen_name: params[1],
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
    body: JSON.stringify({ author_name: '  Ursula K. Le Guin  ', author_pen_name: '  U. K. Le Guin  ' }),
  });

  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), {
    author: {
      author_id: '8',
      author_name: 'Ursula K. Le Guin',
      author_pen_name: 'U. K. Le Guin',
    },
  });
  assert.deepEqual(queries[0].params, ['Ursula K. Le Guin', 'U. K. Le Guin']);

  const invalid = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_name: '   ', author_pen_name: [] }),
  });
  assert.equal(invalid.status, 400);
  assert.equal(queries.length, 1);

  const anonymous = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_name: 'Anonymous' }),
  });
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 1);
});

test('lists authors with server-side pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) {
        return { rows: [{ total: '21' }] };
      }
      if (sql.includes('LIMIT $1 OFFSET $2')) {
        return { rows: [{ author_id: '11', author_name: 'Octavia E. Butler', author_pen_name: null }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}?page=2&pageSize=10`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    authors: [{ author_id: '11', author_name: 'Octavia E. Butler', author_pen_name: null }],
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
  assert.equal(queries.length, 2);
});

test('returns not found for missing authors and validates route IDs', async (t) => {
  const pool = {
    async query() {
      return { rows: [] };
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const missing = await fetch(`${baseUrl}/999`, { headers });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'Author not found.' });

  const invalidId = await fetch(`${baseUrl}/0`, { headers });
  assert.equal(invalidId.status, 400);

  const missingUpdate = await fetch(`${baseUrl}/999`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_name: 'Missing Author' }),
  });
  assert.equal(missingUpdate.status, 404);

  const missingDelete = await fetch(`${baseUrl}/999`, {
    method: 'DELETE',
    headers,
  });
  assert.equal(missingDelete.status, 404);
});

test('returns a safe error when the database fails', async (t) => {
  const pool = {
    async query() {
      throw new Error('database unavailable');
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_name: 'N. K. Jemisin' }),
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Internal server error.' });
});
