export type LocalRecord = { id: string; [key: string]: unknown };
const revisions = new Map<string, number>();
const pending = new Map<string, Promise<unknown>>();
export async function localRequest(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  const data = await response.json() as { error?: string; records: LocalRecord[]; revision: number; url?: string };
  if (!response.ok) throw new Error(data.error || 'The local content server could not complete the request.');
  return data;
}
export async function readLocal<T extends { id: string }>(collection: string): Promise<T[]> {
  if (typeof window === 'undefined') return [];
  const running = pending.get(collection);
  if (running) return running as Promise<T[]>;
  const task = (async () => {
    let result = await localRequest('/api/local-cms/' + encodeURIComponent(collection));
    // Import the existing preview once, without deleting the original browser backup.
    // An initialized empty collection is authoritative and must never be re-seeded.
    if (result.revision === 0) {
      const saved = localStorage.getItem('rj-demo-' + collection);
      const records = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(records)) throw new Error('Existing browser records are invalid; they have not been overwritten.');
      try {
        const imported = await localRequest('/api/local-cms/' + encodeURIComponent(collection), {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records, revision: 0 }),
        });
        result = { records, revision: imported.revision };
      } catch {
        result = await localRequest('/api/local-cms/' + encodeURIComponent(collection));
        if (!result.revision) throw new Error('Unable to import existing records. Your browser backup is unchanged.');
      }
    }
    revisions.set(collection, result.revision);
    return result.records as T[];
  })();
  pending.set(collection, task);
  try { return await task; } finally { pending.delete(collection); }
}
export async function writeLocal<T extends { id: string }>(collection: string, items: T[]) {
  if (!revisions.has(collection)) await readLocal(collection);
  const result = await localRequest('/api/local-cms/' + encodeURIComponent(collection), {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: items, revision: revisions.get(collection) }),
  });
  revisions.set(collection, result.revision);
  window.dispatchEvent(new CustomEvent('rj-demo-data', { detail: { collection } }));
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('rj-content');
    channel.postMessage(collection);
    channel.close();
  }
}
export async function published<T extends { id: string; status?: unknown }>(collection: string) {
  return (await readLocal<T>(collection)).filter(item => ['published', 'approved'].includes(String(item.status).toLowerCase()));
}
export function subscribeLocal<T extends { id: string }>(collection: string, callback: (items: T[]) => void, onError?: (error: Error) => void) {
  let stopped = false;
  let loading = false;
  let reload = false;
  let previous = '';
  async function load() {
    if (loading) { reload = true; return; }
    loading = true;
    try {
      const items = await readLocal<T>(collection);
      const signature = JSON.stringify(items);
      if (!stopped && signature !== previous) { previous = signature; callback(items); }
    } catch (error) { if (!stopped) onError?.(error instanceof Error ? error : new Error('Unable to load content.')); }
    finally { loading = false; if (reload && !stopped) { reload = false; void load(); } }
  }
  const onChange = (event: Event) => { if ((event as CustomEvent).detail?.collection === collection) void load(); };
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('rj-content') : null;
  if (channel) channel.onmessage = event => { if (event.data === collection) void load(); };
  void load();
  const timer = window.setInterval(() => { if (!document.hidden) void load(); }, 2000);
  window.addEventListener('rj-demo-data', onChange);
  window.addEventListener('focus', load);
  return () => { stopped = true; clearInterval(timer); channel?.close(); window.removeEventListener('rj-demo-data', onChange); window.removeEventListener('focus', load); };
}
