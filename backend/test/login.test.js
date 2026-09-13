const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');

const jwtSecret = 'test-secret-that-is-at-least-32-bytes-long';
test('login HTTP behavior', async (t) => {
  const user = { user_id: '42', user_name: 'Reader', user_email: 'reader@example.com',
    user_pass: await bcrypt.hash('correct-password', 12) };
  let fail = false;
  let queries = 0;
  const pool = { async query(sql, params) {
    queries++;
    assert.match(sql, /user_email = \$1/);
    if (fail) throw new Error('database unavailable');
    return { rows: params[0] === user.user_email ? [user] : [] };
  } };
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const login = (body) => fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const valid = { email: user.user_email, password: 'correct-password' };
  const success = await login(valid);
  assert.equal(success.status, 200);
  const body = await success.json();
  const cookie = success.headers.get('set-cookie');
  const token = decodeURIComponent(cookie.match(/access_token=([^;]+)/)[1]);
  const claims = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
  assert.equal(claims.sub, '42');
  assert.equal(claims.exp - claims.iat, 3600);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.equal(body.accessToken, undefined);
  assert.equal(body.user.user_pass, undefined);
  assert.equal(success.headers.get('cache-control'), 'no-store');
  const wrong = await login({ ...valid, password: 'wrong' });
  const missing = await login({ ...valid, email: 'missing@example.com' });
  assert.equal(wrong.status, 401);
  assert.equal(missing.status, 401);
  assert.deepEqual(await wrong.json(), await missing.json());
  const before = queries;
  for (const input of [{}, { ...valid, email: [] }, { ...valid, password: 'ก'.repeat(25) }]) {
    assert.equal((await login(input)).status, 400);
  }
  assert.equal(queries, before);
  assert.equal((await login('{')).status, 400);
  fail = true;
  const failure = await login(valid);
  assert.equal(failure.status, 500);
  assert.deepEqual(await failure.json(), { message: 'Internal server error.' });
  fail = false;
  for (let i = 0; i < 3; i++) await login({});
  assert.equal((await login(valid)).status, 429);
});

test('username login and ambiguous accounts', async (t) => {
  const user = { user_id: '43', user_name: 'Reader', user_email: 'reader@example.com',
    user_pass: await bcrypt.hash('correct-password', 12) };
  let queries = 0;
  const pool = { async query(sql, params) {
    queries++;
    assert.match(sql, /user_name = \$1 LIMIT 2/);
    return { rows: params[0] === 'Reader' ? [user] : params[0] === 'duplicate'
      ? [user, { ...user, user_id: '44' }] : [] };
  } };
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const login = body => fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const valid = { username: ' Reader ', password: 'correct-password' };
  const success = await login(valid);
  assert.equal(success.status, 200);
  const body = await success.json();
  const cookie = success.headers.get('set-cookie');
  const token = decodeURIComponent(cookie.match(/access_token=([^;]+)/)[1]);
  assert.equal(jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }).sub, '43');
  assert.equal(body.accessToken, undefined);
  assert.equal(body.user.user_pass, undefined);
  for (const input of [{ ...valid, password: 'wrong' }, { ...valid, username: 'missing' },
    { ...valid, username: 'duplicate' }, { ...valid, username: "' OR 1=1 --" }]) {
    const response = await login(input);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { message: 'Invalid email, username or password.' });
  }
  const before = queries;
  for (const username of ['', '   ', [], 'a'.repeat(101)]) {
    assert.equal((await login({ ...valid, username })).status, 400);
  }
  assert.equal((await login({ ...valid, email: user.user_email })).status, 400);
  assert.equal(queries, before);
});

test('requires a strong configured secret', () => {
  for (const jwtSecret of [undefined, '', 'short']) {
    assert.throws(() => createApp({ pool: {}, jwtSecret }), /JWT_SECRET/);
  }
});

test('restores an authenticated session from the access-token cookie', async (t) => {
  const user = { user_id: '55', user_name: 'Reader', user_email: 'reader@example.com',
    user_pass: await bcrypt.hash('correct-password', 12) };
  const pool = { async query(sql, params) {
    if (/user_email = \$1/.test(sql)) {
      return { rows: params[0] === user.user_email ? [user] : [] };
    }
    if (/user_id = \$1/.test(sql)) {
      return { rows: params[0] === user.user_id ? [user] : [] };
    }
    throw new Error(`Unexpected query: ${sql}`);
  } };
  const server = createApp({ pool, jwtSecret }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/auth`;

  const login = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.user_email, password: 'correct-password' }),
  });
  const cookie = login.headers.get('set-cookie').split(';')[0];

  const me = await fetch(`${baseUrl}/me`, { headers: { Cookie: cookie } });
  assert.equal(me.status, 200);
  assert.deepEqual(await me.json(), {
    user: { user_id: '55', user_name: 'Reader', user_email: 'reader@example.com' },
  });

  const anonymous = await fetch(`${baseUrl}/me`);
  assert.equal(anonymous.status, 401);

  const logout = await fetch(`${baseUrl}/logout`, { method: 'POST', headers: { Cookie: cookie } });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /access_token=;/);
});
