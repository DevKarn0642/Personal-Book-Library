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
    baseUrl: `http://127.0.0.1:${server.address().port}/api/shelves`,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('creates a shelf, normalizes optional text, and rejects invalid or anonymous requests', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('INSERT INTO shelf')) {
        return {
          rows: [{
            shelf_id: '8',
            shelf_name: params[0],
            shelf_limit: params[1],
            shelf_color: params[2],
            shelf_material: params[3],
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
      shelf_name: '  ห้องนั่งเล่น  ',
      shelf_limit: 0,
      shelf_color: '  Walnut  ',
      shelf_material: '   ',
    }),
  });

  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), {
    shelf: {
      shelf_id: '8',
      shelf_name: 'ห้องนั่งเล่น',
      shelf_limit: 0,
      shelf_color: 'Walnut',
      shelf_material: null,
    },
  });
  assert.deepEqual(queries[0].params, ['ห้องนั่งเล่น', 0, 'Walnut', null]);

  const invalid = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_name: 'Shelf', shelf_limit: -1 }),
  });
  assert.equal(invalid.status, 400);
  assert.equal(queries.length, 1);

  const anonymous = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_name: 'Shelf' }),
  });
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 1);
});

test('lists shelves with server-side pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) {
        return { rows: [{ total: '21' }] };
      }
      if (sql.includes('LIMIT $1 OFFSET $2')) {
        return {
          rows: [{
            shelf_id: '11',
            shelf_name: 'Bedroom',
            shelf_limit: 50,
            shelf_color: 'White',
            shelf_material: 'Steel',
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}?page=2&pageSize=10`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    shelves: [{
      shelf_id: '11',
      shelf_name: 'Bedroom',
      shelf_limit: 50,
      shelf_color: 'White',
      shelf_material: 'Steel',
    }],
    pagination: { page: 2, pageSize: 10, total: 21, totalPages: 3 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('LIMIT $1 OFFSET $2')).params,
    [10, 10],
  );

  const invalid = await fetch(`${baseUrl}?page=1&pageSize=101`, { headers });
  assert.equal(invalid.status, 400);

  const anonymous = await fetch(baseUrl);
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 2);
});

test('returns not found for missing shelves and validates route IDs', async (t) => {
  const pool = {
    async query() {
      return { rows: [] };
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const missing = await fetch(`${baseUrl}/999`, { headers });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'Shelf not found.' });

  const invalidId = await fetch(`${baseUrl}/0`, { headers });
  assert.equal(invalidId.status, 400);

  const missingUpdate = await fetch(`${baseUrl}/999`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_name: 'Missing shelf' }),
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
    body: JSON.stringify({ shelf_name: 'Bedroom shelf' }),
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Internal server error.' });
});
