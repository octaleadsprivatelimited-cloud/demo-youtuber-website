import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.LOCAL_CMS_TEST_URL || 'http://localhost:3000';
const name = 'qa-' + crypto.randomUUID();
const endpoint = base + '/api/local-cms/' + name;
const put = (records, revision, extraHeaders = {}) => fetch(endpoint, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', ...extraHeaders },
  body: JSON.stringify({ records, revision })
});
test('persistent records survive new clients, reject stale saves, and remain empty after clearing', async () => {
  assert.equal((await (await fetch(endpoint)).json()).revision, 0);
  assert.equal((await put([{ id: 'fixture', title: 'First image' }], 0)).status, 200);
  const saved = await (await fetch(endpoint, { cache: 'no-store' })).json();
  assert.equal(saved.records[0].title, 'First image');
  assert.equal((await put([{ id: 'fixture', title: 'Replacement' }], saved.revision)).status, 200);
  assert.equal((await put([{ id: 'fixture', title: 'Stale image' }], saved.revision)).status, 409);
  const updated = await (await fetch(endpoint)).json();
  assert.equal(updated.records[0].title, 'Replacement');
  assert.equal((await put([], updated.revision)).status, 200);
  assert.deepEqual((await (await fetch(endpoint)).json()).records, []);
});
test('local CMS rejects requests from another origin', async () => {
  assert.equal((await put([], 0, { Origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await fetch(endpoint, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
});
test('image upload returns a unique durable URL with matching bytes', async () => {
  const bytes = await fs.readFile(new URL('../public/hero/mahindra-575-di-xp-plus.webp', import.meta.url));
  const upload = async () => {
    const form = new FormData();
    form.set('file', new File([bytes], 'test.webp', { type: 'image/webp' }));
    const response = await fetch(base + '/api/local-media', { method: 'POST', body: form });
    assert.equal(response.status, 201);
    return (await response.json()).url;
  };
  const first = await upload();
  const second = await upload();
  assert.notEqual(first, second);
  const response = await fetch(base + first);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
});
test('invalid image data cannot be saved as a working image', async () => {
  const form = new FormData();
  form.set('file', new File(['not a png'], 'invalid.png', { type: 'image/png' }));
  const response = await fetch(base + '/api/local-media', { method: 'POST', body: form });
  assert.equal(response.status, 400);
});
