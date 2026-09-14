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

test('creates a shelf floor after validating its shelf', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('SELECT shelf_id')) {
        return { rows: [{ shelf_id: params[0] }] };
      }
      if (sql.includes('INSERT INTO shelf_floor')) {
        return {
          rows: [{
            shelf_floor_id: '21',
            shelf_id: params[0],
            shelf_floor_limit: params[1],
            shelf_floor: params[2],
            book_id: params[3],
            category_id: params[4],
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/8/floors`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shelf_floor: 2,
      shelf_floor_limit: 30,
      book_id: '13',
      category_id: '5',
    }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    shelfFloor: {
      shelf_floor_id: '21',
      shelf_id: '8',
      shelf_floor_limit: 30,
      shelf_floor: 2,
      book_id: '13',
      category_id: '5',
    },
  });
  assert.deepEqual(queries[1].params, ['8', 30, 2, '13', '5']);
});

test('rejects invalid input and anonymous requests before querying', async (t) => {
  const pool = {
    async query() {
      throw new Error('A query should not be made.');
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const invalid = await fetch(`${baseUrl}/8/floors`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_floor: 0 }),
  });
  assert.equal(invalid.status, 400);

  const anonymous = await fetch(`${baseUrl}/8/floors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_floor: 1 }),
  });
  assert.equal(anonymous.status, 401);
});

test('returns not found when the requested shelf does not exist', async (t) => {
  const pool = {
    async query() {
      return { rows: [] };
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/999/floors`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_floor: 1 }),
  });

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Shelf not found.' });
});

test('lists shelf floors with server-side pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('SELECT shelf_id')) {
        return { rows: [{ shelf_id: params[0] }] };
      }
      if (sql.includes('COUNT(*) AS total')) {
        return { rows: [{ total: '2' }] };
      }
      if (sql.includes('ORDER BY shelf_floor ASC')) {
        return {
          rows: [{
            shelf_floor_id: '21',
            shelf_id: '8',
            shelf_floor_limit: 30,
            shelf_floor: 1,
            book_id: null,
            category_id: null,
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/8/floors?page=1&pageSize=10`, { headers });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    shelfFloors: [{
      shelf_floor_id: '21',
      shelf_id: '8',
      shelf_floor_limit: 30,
      shelf_floor: 1,
      book_id: null,
      category_id: null,
    }],
    pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('ORDER BY shelf_floor ASC')).params,
    ['8', 10, 0],
  );
});

test('gets, updates, and deletes a shelf floor only within its shelf', async (t) => {
  const pool = {
    async query(sql, params) {
      if (sql.includes('SELECT shelf_id')) {
        return { rows: [{ shelf_id: params[0] }] };
      }
      if (sql.includes('SELECT shelf_floor_id')) {
        return {
          rows: [{
            shelf_floor_id: '21',
            shelf_id: params[0],
            shelf_floor_limit: 30,
            shelf_floor: 1,
            book_id: null,
            category_id: null,
          }],
        };
      }
      if (sql.includes('UPDATE shelf_floor')) {
        return {
          rows: [{
            shelf_floor_id: params[5],
            shelf_id: params[4],
            shelf_floor_limit: params[0],
            shelf_floor: params[1],
            book_id: params[2],
            category_id: params[3],
          }],
        };
      }
      if (sql.includes('DELETE FROM shelf_floor')) {
        return { rows: [{ shelf_floor_id: params[1], shelf_id: params[0] }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const found = await fetch(`${baseUrl}/8/floors/21`, { headers });
  assert.equal(found.status, 200);
  assert.equal((await found.json()).shelfFloor.shelf_floor_id, '21');

  const updated = await fetch(`${baseUrl}/8/floors/21`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_floor: 2, shelf_floor_limit: 40 }),
  });
  assert.equal(updated.status, 200);
  assert.deepEqual((await updated.json()).shelfFloor, {
    shelf_floor_id: '21',
    shelf_id: '8',
    shelf_floor_limit: 40,
    shelf_floor: 2,
    book_id: null,
    category_id: null,
  });

  const deleted = await fetch(`${baseUrl}/8/floors/21`, {
    method: 'DELETE',
    headers,
  });
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { success: true });
});

test('returns a safe error when the database fails', async (t) => {
  const pool = {
    async query() {
      throw new Error('database unavailable');
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/8/floors`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ shelf_floor: 1 }),
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: 'Internal server error.' });
});
