const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');

const jwtSecret = 'test-secret-that-is-at-least-32-bytes-long';

test('lists categories with server-side pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) {
        return { rows: [{ total: '25' }] };
      }
      if (sql.includes('LIMIT $1 OFFSET $2')) {
        return { rows: [{ category_id: '11', category_name: 'Novel' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));

  const token = jwt.sign({}, jwtSecret, { algorithm: 'HS256', subject: '1' });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/categories`;
  const response = await fetch(`${baseUrl}?page=2&pageSize=10`, {
    headers: { Cookie: `access_token=${token}` },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    categories: [{ category_id: '11', category_name: 'Novel' }],
    pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('LIMIT $1 OFFSET $2')).params,
    [10, 10],
  );

  const invalid = await fetch(`${baseUrl}?page=1&pageSize=101`, {
    headers: { Cookie: `access_token=${token}` },
  });
  assert.equal(invalid.status, 400);
  assert.equal(queries.length, 2);

  const anonymous = await fetch(baseUrl);
  assert.equal(anonymous.status, 401);
});
