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
    baseUrl: `http://127.0.0.1:${server.address().port}/api/alerts`,
    headers: { Cookie: `access_token=${token}` },
  };
}

test('creates an alert for the authenticated user and validates its input', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('INSERT INTO alert')) {
        return {
          rows: [{
            alert_id: '9',
            alert_repeat_type: params[0],
            alert_date: params[1],
            alert_status: params[2],
            alert_time: params[3],
            user_id: params[4],
            book_id: params[5],
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
    body: JSON.stringify({
      alert_repeat_type: '  weekly  ',
      alert_date: '2026-10-03',
      alert_status: false,
      alert_time: '08:30:15',
      book_id: '12',
    }),
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    alert: {
      alert_id: '9',
      alert_repeat_type: 'weekly',
      alert_date: '2026-10-03',
      alert_status: false,
      alert_time: '08:30:15',
      user_id: '1',
      book_id: '12',
    },
  });
  assert.deepEqual(queries[0].params, ['weekly', '2026-10-03', false, '08:30:15', '1', '12']);

  const invalid = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_date: '2026-02-30' }),
  });
  assert.equal(invalid.status, 400);

  const suppliedUser = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: '2' }),
  });
  assert.equal(suppliedUser.status, 400);
  assert.equal(queries.length, 1);

  const anonymous = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 1);
});

test('lists only the current user alerts with pagination', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('COUNT(*) AS total')) {
        return { rows: [{ total: '11' }] };
      }
      if (sql.includes('ORDER BY alert_date ASC')) {
        return {
          rows: [{
            alert_id: '9',
            alert_repeat_type: null,
            alert_date: '2026-10-03',
            alert_status: true,
            alert_time: '08:30:00',
            user_id: params[0],
            book_id: null,
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
    alerts: [{
      alert_id: '9',
      alert_repeat_type: null,
      alert_date: '2026-10-03',
      alert_status: true,
      alert_time: '08:30:00',
      user_id: '7',
      book_id: null,
    }],
    pagination: { page: 2, pageSize: 5, total: 11, totalPages: 3 },
  });
  assert.deepEqual(
    queries.find(query => query.sql.includes('ORDER BY alert_date ASC')).params,
    ['7', 5, 5],
  );
  assert.deepEqual(
    queries.find(query => query.sql.includes('COUNT(*) AS total')).params,
    ['7'],
  );

  const invalid = await fetch(`${baseUrl}?pageSize=101`, { headers });
  assert.equal(invalid.status, 400);
  assert.equal(queries.length, 2);
});

test('lists books for the alert book selector', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('SELECT book_id, book_name')) {
        return { rows: [{ book_id: '12', book_name: 'A Wizard of Earthsea' }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool);

  const response = await fetch(`${baseUrl}/books`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    books: [{ book_id: '12', book_name: 'A Wizard of Earthsea' }],
  });
  assert.equal(queries.length, 1);
  assert.deepEqual(queries[0].params, undefined);
});

test('lists active alerts for only the authenticated user', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('alert.alert_status = TRUE')) {
        return {
          rows: [{
            alert_id: '9',
            alert_repeat_type: 'daily',
            alert_date: '2026-10-03',
            alert_status: true,
            alert_time: '08:30:00',
            user_id: params[0],
            book_id: '12',
            book_name: 'A Wizard of Earthsea',
          }],
        };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool, '7');

  const response = await fetch(`${baseUrl}/active`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    alerts: [{
      alert_id: '9',
      alert_repeat_type: 'daily',
      alert_date: '2026-10-03',
      alert_status: true,
      alert_time: '08:30:00',
      user_id: '7',
      book_id: '12',
      book_name: 'A Wizard of Earthsea',
    }],
  });
  assert.deepEqual(queries[0].params, ['7']);

  const anonymous = await fetch(`${baseUrl}/active`);
  assert.equal(anonymous.status, 401);
  assert.equal(queries.length, 1);
});

test('gets, updates, and deletes an alert only when owned by the authenticated user', async (t) => {
  const queries = [];
  const pool = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('SELECT alert_id')) {
        return {
          rows: [{
            alert_id: params[0],
            alert_repeat_type: 'daily',
            alert_date: '2026-10-03',
            alert_status: true,
            alert_time: '08:30:00',
            user_id: params[1],
            book_id: null,
          }],
        };
      }
      if (sql.includes('UPDATE alert')) {
        return {
          rows: [{
            alert_id: params[5],
            alert_repeat_type: params[0],
            alert_date: params[1],
            alert_status: params[2],
            alert_time: params[3],
            book_id: params[4],
            user_id: params[6],
          }],
        };
      }
      if (sql.includes('DELETE FROM alert')) {
        return { rows: [{ alert_id: params[0], user_id: params[1] }] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  const { baseUrl, headers } = await startServer(t, pool, '7');

  const found = await fetch(`${baseUrl}/9`, { headers });
  assert.equal(found.status, 200);
  assert.equal((await found.json()).alert.user_id, '7');
  assert.deepEqual(queries[0].params, ['9', '7']);

  const updated = await fetch(`${baseUrl}/9`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alert_date: '2026-10-04', alert_time: '09:00' }),
  });
  assert.equal(updated.status, 200);
  assert.deepEqual((await updated.json()).alert, {
    alert_id: '9',
    alert_repeat_type: null,
    alert_date: '2026-10-04',
    alert_status: true,
    alert_time: '09:00',
    book_id: null,
    user_id: '7',
  });
  assert.deepEqual(queries[1].params, [null, '2026-10-04', true, '09:00', null, '9', '7']);

  const deleted = await fetch(`${baseUrl}/9`, { method: 'DELETE', headers });
  assert.equal(deleted.status, 200);
  assert.deepEqual(await deleted.json(), { success: true });
  assert.deepEqual(queries[2].params, ['9', '7']);
});

test('returns not found for inaccessible alerts and a safe error for database failures', async (t) => {
  const missingPool = {
    async query() {
      return { rows: [] };
    },
  };
  const missingServer = await startServer(t, missingPool);

  const missing = await fetch(`${missingServer.baseUrl}/999`, { headers: missingServer.headers });
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { message: 'Alert not found.' });

  const failedPool = {
    async query() {
      throw new Error('database unavailable');
    },
  };
  const failedServer = await startServer(t, failedPool);
  const failed = await fetch(failedServer.baseUrl, {
    method: 'POST',
    headers: { ...failedServer.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(failed.status, 500);
  assert.deepEqual(await failed.json(), { message: 'Internal server error.' });
});
