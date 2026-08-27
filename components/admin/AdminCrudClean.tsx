'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { AdminSection } from '@/config/admin-sections';
import { listAdminRecords, removeAdminRecord, saveAdminRecord, type AdminRecord } from '@/services/admin';
import { AdminDialog } from './AdminDialog';
import { AdminImageField } from './AdminImageField';

const recordName = (item: AdminRecord) => String(item.title ?? item.model ?? item.name ?? item.email ?? item.tractorName ?? 'Untitled');
export function AdminCrudClean({ section }: { section: AdminSection }) {
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('');
  const requestId = useRef(0);
  const hero = section.collection === 'heroSlides';
  const busy = saving || uploading;
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true); setError('');
    try {
      const records = await listAdminRecords(section.collection);
      if (id === requestId.current) setItems(records.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)));
    } catch (reason) { if (id === requestId.current) setError(reason instanceof Error ? reason.message : 'Unable to load records.'); }
    finally { if (id === requestId.current) setLoading(false); }
  }, [section.collection]);
  useEffect(() => { void load(); return () => { requestId.current++; }; }, [load]);
  function edit(item?: AdminRecord) {
    setEditing(item ?? null);
    setForm(item ? {
      ...item, title: item.title ?? item.name ?? '', brand: item.brand ?? item.brandName ?? '',
      horsepower: item.horsepower ?? item.hp ?? '', price: item.price ?? item.minPrice ?? '',
      image: item.image ?? item.coverImage ?? '', content: item.content ?? item.body ?? '',
      youtubeId: item.youtubeId ?? item.youtubeVideoId ?? '',
    } : { order: Math.max(0, ...items.map(row => Number(row.order) || 0)) + 1, backgroundColor: '#ffffff' });
    setFormError(''); setNotice(''); setOpen(true);
  }
  function change(key: string, value: unknown) { setForm(current => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setSaving(true); setFormError('');
    try {
      await saveAdminRecord(section.collection, editing?.id, form);
      setOpen(false);
      setNotice(hero ? 'Slide saved. The homepage updates automatically.' : 'Record saved successfully.');
      await load();
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : 'Unable to save.'); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!deleting || busy) return;
    setSaving(true); setFormError('');
    try {
      await removeAdminRecord(section.collection, deleting.id);
      setDeleting(null); setNotice('Record deleted.'); await load();
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : 'Unable to delete.'); }
    finally { setSaving(false); }
  }
  const visible = items.filter(item => recordName(item).toLowerCase().includes(filter.toLowerCase()));
  return <div className="cms-admin">
    <header className="cms-page-heading"><div><p>{hero ? 'HOMEPAGE CONTENT' : 'CONTENT MANAGEMENT'}</p><h1>{section.label}</h1><span>{section.description}</span></div>
      <div className="cms-actions">{hero && <a href="/" target="_blank" rel="noreferrer">Preview homepage ↗</a>}<button type="button" className="cms-primary" onClick={() => edit()}>{hero ? '+ Add slide' : '+ New record'}</button></div></header>
    {notice && <div className="cms-notice" role="status">{notice}</div>}
    {error && <div className="cms-error" role="alert">{error}</div>}
    <section className="cms-panel">
      <div className="cms-toolbar"><strong>{loading ? 'Loading records…' : items.length + (items.length === 1 ? ' record' : ' records')}</strong>
        <input aria-label={'Search ' + section.label} placeholder="Search records…" value={filter} onChange={event => setFilter(event.target.value)}/>
        <button type="button" disabled={loading} onClick={() => void load()}>Refresh</button></div>
      {!loading && !visible.length && <div className="cms-empty"><h2>{filter ? 'No matching records' : hero ? 'No slides yet' : 'No records yet'}</h2>
        <p>{filter ? 'Try another name.' : hero ? 'Add your first image. The homepage remains blank until you save a slide.' : 'Create a record using the button above.'}</p></div>}
      {hero ? <div className="cms-slide-grid">{visible.map(item => <article key={item.id} className="cms-slide">
        <div className="cms-slide-preview" style={{ backgroundColor: String(item.backgroundColor || '#f3f4f6') }}>
          {item.image ? <img src={String(item.image)} alt={recordName(item)}/> : <span>Blank slide</span>}
          <small>SLIDE {String(item.order ?? 1)}</small></div>
        <div className="cms-slide-details"><h2>{recordName(item)}</h2><p>{item.image ? 'Saved image' : 'No image · background colour only'}</p>
          <div className="cms-actions"><button onClick={() => edit(item)}>Edit</button><button className="cms-danger" onClick={() => { setDeleting(item); setFormError(''); }}>Delete</button></div></div>
      </article>)}</div> : <div className="cms-record-list">{visible.map(item => <article key={item.id}>
        <div><strong>{recordName(item)}</strong><small>{String(item.slug ?? item.path ?? item.key ?? '')}</small></div>
        <div className="cms-actions"><button onClick={() => edit(item)}>Edit</button><button className="cms-danger" onClick={() => { setDeleting(item); setFormError(''); }}>Delete</button></div>
      </article>)}</div>}
    </section>
    {open && <AdminDialog title={(editing ? 'Edit ' : 'Add ') + (hero ? 'hero slide' : section.label.toLowerCase())} busy={busy} onClose={() => setOpen(false)}>
      <form className="cms-form" onSubmit={submit}>
        <div className="cms-fields">{section.fields.map(field => field.type === 'image' ?
          <AdminImageField key={field.key} label={field.label} value={String(form[field.key] ?? '')} folder={section.collection} disabled={busy}
            onChange={value => change(field.key, value)} onBusy={setUploading} onError={setFormError}/> :
          <label key={field.key} className={field.type === 'textarea' ? 'cms-wide' : ''}>{field.label}{field.required && <span aria-hidden="true"> *</span>}
            {field.type === 'textarea' ? <textarea required={field.required} disabled={busy} rows={field.key === 'content' ? 8 : 3} value={String(form[field.key] ?? '')} onChange={event => change(field.key, event.target.value)}/> :
              field.type === 'boolean' ? <input type="checkbox" disabled={busy} checked={Boolean(form[field.key])} onChange={event => change(field.key, event.target.checked)}/> :
              <input disabled={busy} required={field.required} type={field.key === 'backgroundColor' ? 'color' : field.type === 'number' ? 'number' : field.key === 'email' ? 'email' : 'text'}
                min={field.key === 'order' || field.key === 'rating' ? 1 : field.type === 'number' ? 0 : undefined}
                max={field.key === 'rating' ? 5 : field.key === 'score' ? 10 : undefined} step={field.key === 'order' ? 1 : field.type === 'number' ? 'any' : undefined}
                value={String(form[field.key] ?? '')} onChange={event => change(field.key, field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)}/>}
          </label>)}</div>
        {hero && <p className="cms-help">Position 1 appears first. Removing the image keeps a blank slide; deleting the record removes that slide from the carousel.</p>}
        {formError && <div className="cms-error" role="alert">{formError}</div>}
        <div className="cms-form-footer"><button type="button" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
          <button className="cms-primary" disabled={busy}>{uploading ? 'Uploading…' : saving ? 'Saving…' : hero ? 'Save slide' : 'Save record'}</button></div>
      </form>
    </AdminDialog>}
    {deleting && <AdminDialog title="Delete record?" busy={busy} onClose={() => setDeleting(null)}>
      <div className="cms-form"><p>Remove “{recordName(deleting)}”? This will remove it from the website.</p>
        {formError && <div className="cms-error" role="alert">{formError}</div>}
        <div className="cms-form-footer"><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className="cms-primary" disabled={busy} onClick={() => void remove()}>{busy ? 'Deleting…' : 'Confirm delete'}</button></div>
      </div>
    </AdminDialog>}
  </div>;
}
