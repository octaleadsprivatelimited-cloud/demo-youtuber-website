import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile(new URL('../lib/admin-records.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { heroImageSource, sortHeroSlides, prepareAdminRecord } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('image URLs remain intact, with no default banner fallback', () => {
  const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
  const signed = 'https://example.com/image.png?token=123&alt=media';
  assert.equal(heroImageSource(data), data);
  assert.equal(heroImageSource(signed), signed);
  assert.equal(heroImageSource('/api/local-media/test.png'), '/api/local-media/test.png');
  assert.equal(heroImageSource(''), '');
  assert.equal(heroImageSource('javascript:alert(1)'), '');
});
test('published slides sort by position and preserve intentional blanks', () => {
  const result = sortHeroSlides([
    { id: 'second', order: 2, status: 'published', image: '' },
    { id: 'draft', order: 1, status: 'draft' },
    { id: 'first', order: 1, status: 'published', image: '/one.png' }
  ]);
  assert.deepEqual(result.map(item => item.id), ['first', 'second']);
  assert.equal(result[1].image, '');
  assert.deepEqual(sortHeroSlides([]), []);
});
test('slugs use the complete title and existing slugs stay stable', () => {
  assert.equal(prepareAdminRecord('articles', { title: 'A complete tractor guide' }).slug, 'a-complete-tractor-guide');
  assert.equal(prepareAdminRecord('articles', { title: 'Updated guide', slug: 'original-guide' }).slug, 'original-guide');
});
test('admin field names match public content fields', () => {
  const tractor = prepareAdminRecord('tractors', { brand: 'Mahindra', model: '575 DI', horsepower: 47, price: 720000 });
  assert.equal(tractor.hp, 47);
  assert.equal(tractor.minPrice, 720000);
  assert.equal(tractor.brandSlug, 'mahindra');
  assert.ok(tractor.searchTerms.includes('mahindra 575 di'));
  const article = prepareAdminRecord('articles', { title: 'Guide', image: '/new.png', content: 'Body' });
  assert.equal(article.coverImage, '/new.png');
  assert.equal(article.body, 'Body');
  assert.equal(prepareAdminRecord('brands', { title: 'Swaraj' }).name, 'Swaraj');
  assert.equal(prepareAdminRecord('reviews', { rating: 5 }).status, 'approved');
});
test('slide positions must be positive whole numbers', () => {
  for (const order of [0, -1, 1.5, NaN]) assert.throws(() => prepareAdminRecord('heroSlides', { title: 'Banner', order }));
  assert.equal(prepareAdminRecord('heroSlides', { title: 'Banner', order: 1, image: '' }).image, '');
});
