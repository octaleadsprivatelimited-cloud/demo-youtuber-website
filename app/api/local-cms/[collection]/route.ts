import { localDatabase, localJson, requireLocalRequest } from '@/lib/local-cms-server';
const validName = /^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/;
type Context = { params: Promise<{ collection: string }> };
async function nameOf(context: Context) {
  const { collection } = await context.params;
  if (!validName.test(collection)) throw new Error('Invalid collection.');
  return collection;
}
export async function GET(request: Request, context: Context) {
  try { requireLocalRequest(request); } catch { return localJson({ error: 'Unavailable' }, 403); }
  try {
    const name = await nameOf(context);
    const database = await localDatabase();
    const row = await database.prepare('SELECT records, revision FROM local_cms_collections WHERE name = ?').bind(name).first<{ records: string; revision: number }>();
    return localJson({ records: row ? JSON.parse(row.records) : [], revision: row?.revision ?? 0 });
  } catch (error) { return localJson({ error: error instanceof Error ? error.message : 'Unable to load content.' }, 500); }
}
export async function PUT(request: Request, context: Context) {
  try { requireLocalRequest(request); } catch { return localJson({ error: 'Unavailable' }, 403); }
  try {
    const name = await nameOf(context);
    const text = await request.text();
    if (text.length > 10 * 1024 * 1024) return localJson({ error: 'This collection is too large to save.' }, 413);
    const { records, revision } = JSON.parse(text);
    if (!Array.isArray(records) || records.length > 5000 || !Number.isInteger(revision) || revision < 0 ||
      records.some(row => !row || typeof row.id !== 'string' || !row.id || row.id.length > 200) ||
      new Set(records.map(row => row.id)).size !== records.length) {
      return localJson({ error: 'Invalid records.' }, 400);
    }
    const database = await localDatabase();
    const result = revision === 0
      ? await database.prepare('INSERT OR IGNORE INTO local_cms_collections (name, records, revision) VALUES (?, ?, 1)').bind(name, JSON.stringify(records)).run()
      : await database.prepare('UPDATE local_cms_collections SET records = ?, revision = revision + 1 WHERE name = ? AND revision = ?').bind(JSON.stringify(records), name, revision).run();
    if (!result.meta.changes) return localJson({ error: 'Content changed in another tab. Refresh and try again.' }, 409);
    return localJson({ revision: revision + 1 });
  } catch (error) { return localJson({ error: error instanceof Error ? error.message : 'Unable to save content.' }, 500); }
}
