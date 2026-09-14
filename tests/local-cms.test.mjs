import test from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.LOCAL_CMS_TEST_URL || 'http://localhost:3000';
test('legacy local database cannot be read or written, including from localhost', async () => {
  for (const method of ['GET', 'PUT']) {
    const response = await fetch(base + '/api/local-cms/tractors', {method, ...(method === 'PUT' ? {headers: {'Content-Type': 'application/json'}, body: JSON.stringify({records: [], revision: 0})} : {})});
    assert.equal(response.status, 403);
  }
});
test('legacy local uploads and downloads are disabled', async () => {
  assert.equal((await fetch(base + '/api/local-media', {method: 'POST'})).status, 403);
  assert.equal((await fetch(base + '/api/local-media/test.webp')).status, 403);
});
