import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.ENVIRONMENT = 'test';
process.env.SECRET_KEY = 'test-secret-key-that-is-long-enough-for-tests';
process.env.GROQ_API_KEY = '';

const { createApp } = await import('../src/app.js');
const { store } = await import('../src/store.js');
const server = createApp().listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
after(() => server.close());
beforeEach(() => store.clear());

async function request(path, { token, ...options } = {}) {
  return fetch(`${baseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } });
}

async function register() {
  const response = await request('/api/auth/register', { method: 'POST',
    body: JSON.stringify({ email: 'USER@example.com', password: 'correct-horse', full_name: 'Test User' }) });
  return { response, body: await response.json() };
}

test('health and security headers match the FastAPI service', async () => {
  const response = await request('/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'MediScan API v1.0' });
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
});

test('register, login, refresh, and protected profile flow', async () => {
  const registered = await register();
  assert.equal(registered.response.status, 201);
  assert.equal(registered.body.token_type, 'bearer');
  assert.ok(registered.body.access_token && registered.body.refresh_token);

  const profile = await request('/api/profile', { token: registered.body.access_token });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).user.email, 'user@example.com');

  const update = await request('/api/profile', { method: 'PUT', token: registered.body.access_token,
    body: JSON.stringify({ height_cm: 170, weight_kg: 65, age: 32, activity_level: 'moderate',
      health_conditions: ['Type 2 Diabetes'] }) });
  assert.equal(update.status, 200);
  assert.deepEqual(await update.json(), { message: 'Profile updated successfully' });

  const login = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'user@example.com', password: 'correct-horse' }) });
  assert.equal(login.status, 200);
  const refresh = await request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token: registered.body.refresh_token }) });
  assert.equal(refresh.status, 200);
});

test('validation and authentication errors preserve expected status and detail', async () => {
  const invalid = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: 'bad', password: 'short' }) });
  assert.equal(invalid.status, 422);
  assert.ok(Array.isArray((await invalid.json()).detail));
  const protectedResponse = await request('/api/dashboard/summary');
  assert.equal(protectedResponse.status, 401);
  assert.equal((await protectedResponse.json()).detail, 'Not authenticated');
});

test('community and dashboard response shapes remain compatible', async () => {
  const { body } = await register();
  const created = await request('/api/community/posts', { method: 'POST', token: body.access_token,
    body: JSON.stringify({ category: 'recipe', title: 'Safe snack idea', body: 'Try this alternative.' }) });
  assert.equal(created.status, 201);
  const postId = (await created.json()).id;
  const voted = await request(`/api/community/posts/${postId}/vote`, { method: 'POST', token: body.access_token,
    body: JSON.stringify({ direction: 'up' }) });
  assert.deepEqual(await voted.json(), { upvotes: 1, downvotes: 0 });
  const posts = await request('/api/community/posts?category=recipe', { token: body.access_token });
  assert.equal((await posts.json()).posts[0].net_votes, 1);
  const summary = await request('/api/dashboard/summary', { token: body.access_token });
  assert.deepEqual(await summary.json(), { total_scans: 0, safe_scans: 0, danger_scans: 0, recent_scans: [], alerts: [] });
});

test('product scan, MediVerdict, history, and dashboard work through the HTTP API', async () => {
  const nativeFetch = globalThis.fetch;
  globalThis.fetch = (url, options) => {
    if (String(url).startsWith('https://world.openfoodfacts.org/')) {
      return Promise.resolve(new Response(JSON.stringify({ status: 1, product: {
        code: '12345678', product_name: 'Test Cereal', brands: 'Example', ingredients_text: 'wheat, sugar',
        nutriments: { sugars_100g: 12, carbohydrates_100g: 30, sodium_100g: 0.2 },
      } }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return nativeFetch(url, options);
  };
  try {
    const { body } = await register();
    await request('/api/profile', { method: 'PUT', token: body.access_token,
      body: JSON.stringify({ health_conditions: ['Type 2 Diabetes'] }) });
    const scan = await request('/api/scan-product', { method: 'POST', token: body.access_token,
      body: JSON.stringify({ barcode: '12345678' }) });
    assert.equal(scan.status, 200);
    const result = await scan.json();
    assert.equal(result.verdict, 'CAUTION');
    assert.equal(result.flags.length, 2);
    assert.equal(result.alert_summaries.length, 2);
    const history = await request('/api/scans/history?page=1&per_page=20', { token: body.access_token });
    assert.equal((await history.json()).scans.length, 1);
    const summary = await request('/api/dashboard/summary', { token: body.access_token });
    assert.equal((await summary.json()).total_scans, 1);
  } finally {
    globalThis.fetch = nativeFetch;
  }
});

test('MediBot fallback uses the exact SSE protocol expected by the frontend', async () => {
  const { body } = await register();
  const response = await request('/api/bot/chat', { method: 'POST', token: body.access_token,
    body: JSON.stringify({ message: 'Hello', product_context: {}, chat_history: [] }) });
  const stream = await response.text();
  assert.match(response.headers.get('content-type'), /^text\/event-stream/);
  assert.match(stream, /data: \{"token":/);
  assert.match(stream, /data: \[DONE\]\n\n$/);
});
