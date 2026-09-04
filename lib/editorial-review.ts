/** Shared publication contract for the editorial CMS. */
export function prepareEditorialReview(input: Record<string, unknown>) {
  const data = { ...input };
  const status = String(data.status || 'draft');
  if (!['draft', 'published', 'archived'].includes(status)) throw new Error('Choose draft, published or archived.');
  data.status = status;
  for (const key of ['pros', 'cons']) {
    const value = data[key];
    data[key] = (Array.isArray(value) ? value : String(value || '').split('\n')).map(String).map(item => item.trim()).filter(Boolean);
  }
  if (data.score !== '' && data.score != null) {
    const score = Number(data.score);
    if (!Number.isFinite(score) || score < 0 || score > 10) throw new Error('Review score must be between 0 and 10.');
    data.score = score;
  } else delete data.score;
  if (status === 'published') {
    for (const key of ['title', 'tractorId', 'authorName', 'excerpt', 'body', 'verdict', 'methodology']) {
      if (!String(data[key] || '').trim()) throw new Error('Add ' + key.replace('tractorId', 'a tractor').replace('authorName', 'an author') + ' before publishing.');
    }
    if (data.score == null) throw new Error('Add a score before publishing.');
    if (String(data.body).length < 100) throw new Error('The review body must contain at least 100 characters before publishing.');
  }
  return data;
}

export function reviewTimestamp(value: unknown): number {
  if (value && typeof value === 'object') {
    if ('seconds' in value) return Number(value.seconds) * 1000;
    if ('toDate' in value && typeof value.toDate === 'function') return value.toDate().getTime();
  }
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
