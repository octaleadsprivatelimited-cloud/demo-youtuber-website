'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { AdminSection } from '@/config/admin-sections';
import { getAdminRecord, listAdminRecords, removeAdminRecord, saveAdminRecord, type AdminRecord } from '@/services/admin';
import { AdminDialog } from './AdminDialog';
import { AdminImageField } from './AdminImageField';
import { TractorFields } from './TractorFields';
import { prepareAdminForm, adminFormChanges, adminSelectOptions } from '@/lib/admin-form';

const recordName = (item: AdminRecord) => String(item.title ?? item.model ?? item.name ?? item.email ?? item.key ?? item.tractorName ?? 'Untitled');
export function AdminCrud({ section }: { section: AdminSection }) {
  const [items, setItems] = useState<AdminRecord[]>([]);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [initialForm, setInitialForm] = useState<Record<string, unknown>>({});
  const [opening, setOpening] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('');
  const [sources,setSources]=useState<Record<string,AdminRecord[]>>({});
  const requestId = useRef(0);
  const hero = section.collection === 'heroSlides';
  const busy = saving || uploading || opening;
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true); setError('');
    try {
      const records = await listAdminRecords(section.collection);
      const sourceNames=[...new Set(section.fields.flatMap(field=>field.source?[field.source]:[]))];
      const related=await Promise.all(sourceNames.map(async name=>[name,await listAdminRecords(name)] as const));
      if(id===requestId.current)setSources(Object.fromEntries(related));
      if (id === requestId.current) setItems(records.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)));
    } catch (reason) { if (id === requestId.current) setError(reason instanceof Error ? reason.message : 'Unable to load records.'); }
    finally { if (id === requestId.current) setLoading(false); }
  }, [section.collection]);
  useEffect(() => { void load(); return () => { requestId.current++; }; }, [load]);
  async function edit(item?: AdminRecord) {
    if (busy) return;
    setOpening(true); setError(''); setNotice('');
    try {
      const current = item ? await getAdminRecord(section.collection, item.id) : null;
      if (item && !current) throw new Error('This record was removed. Refresh the list before editing.');
      const next = prepareAdminForm(section, current, items, sources);
      setEditing(current); setForm(next); setInitialForm(next);
      setFormError(''); setOpen(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to open this record.'); }
    finally { setOpening(false); }
  }
  function change(key: string, value: unknown) { setForm(current => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || section.readOnly) return;
    setSaving(true); setFormError('');
    try {
      await saveAdminRecord(section.collection, editing?.id, editing ? adminFormChanges(section, initialForm, form) : form, editing ?? undefined);
      setOpen(false);
      setNotice(hero ? 'Slide saved. The homepage updates automatically.' : editing ? 'Changes saved. You can edit this record again at any time.' : 'Record saved. Use Edit to update it at any time.');
      await load();
    } catch (reason) { setFormError(reason instanceof Error ? reason.message : 'Unable to save.'); }
    finally { setSaving(false); }
  }
  async function moderate(item:AdminRecord,status:'approved'|'rejected'){
    setSaving(true);setError('');
    try{await saveAdminRecord(section.collection,item.id,{...item,status});await load();setNotice('Review '+status+'.');}
    catch(reason){setError(reason instanceof Error?reason.message:'Unable to update review.');}
    finally{setSaving(false);}
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
  return <LocalizedElement as="div" className="cms-admin">
    <header className="cms-page-heading"><LocalizedElement as="div"><LocalizedElement as="p">{hero ? 'HOMEPAGE CONTENT' : 'CONTENT MANAGEMENT'}</LocalizedElement><LocalizedElement as="h1">{section.label}</LocalizedElement><LocalizedElement as="span">{section.description}</LocalizedElement></LocalizedElement>
      <LocalizedElement as="div" className="cms-actions">{hero && <LocalizedElement as="a" href="/" target="_blank" rel="noreferrer">Preview homepage ↗</LocalizedElement>}{section.allowCreate!==false&&<LocalizedElement as="button" type="button" className="cms-primary" disabled={busy||loading} onClick={() => void edit()}>{hero ? '+ Add slide' : '+ New record'}</LocalizedElement>}</LocalizedElement></header>
    {opening && <LocalizedElement as="p" role="status">Opening the latest saved details…</LocalizedElement>}
    {notice && <LocalizedElement as="div" className="cms-notice" role="status">{notice}</LocalizedElement>}
    {error && <LocalizedElement as="div" className="cms-error" role="alert">{error}</LocalizedElement>}
    <section className="cms-panel">
      <LocalizedElement as="div" className="cms-toolbar"><LocalizedElement as="strong">{loading ? 'Loading records…' : items.length + (items.length === 1 ? ' record' : ' records')}</LocalizedElement>
        <LocalizedElement as="input" aria-label={'Search ' + section.label} placeholder="Search records…" value={filter} onChange={event => setFilter(event.target.value)}/>
        <LocalizedElement as="button" type="button" disabled={loading} onClick={() => void load()}>Refresh</LocalizedElement></LocalizedElement>
      {!loading && !visible.length && <LocalizedElement as="div" className="cms-empty"><LocalizedElement as="h2">{filter ? 'No matching records' : hero ? 'No slides yet' : 'No records yet'}</LocalizedElement>
        <LocalizedElement as="p">{filter ? 'Try another name.' : hero ? 'Add your first image. The homepage remains blank until you save a slide.' : section.allowCreate===false?'Submissions will appear here when received.':'Create a record using the button above.'}</LocalizedElement></LocalizedElement>}
      {hero ? <LocalizedElement as="div" className="cms-slide-grid">{visible.map(item => <article key={item.id} className="cms-slide">
        <LocalizedElement as="div" className="cms-slide-preview" style={{ backgroundColor: String(item.backgroundColor || '#f3f4f6') }}>
          {item.image ? <LocalizedElement as="img" src={String(item.image)} alt={recordName(item)}/> : <LocalizedElement as="span">Blank slide</LocalizedElement>}
          <LocalizedElement as="small">SLIDE {String(item.order ?? 1)}</LocalizedElement></LocalizedElement>
        <LocalizedElement as="div" className="cms-slide-details"><LocalizedElement as="h2">{recordName(item)}</LocalizedElement><LocalizedElement as="p">{item.image ? 'Saved image' : 'No image · background colour only'}</LocalizedElement>
          <LocalizedElement as="div" className="cms-actions">{section.moderation&&<><LocalizedElement as="button" disabled={busy||item.status==="approved"} onClick={()=>void moderate(item,"approved")}>Approve</LocalizedElement><LocalizedElement as="button" disabled={busy||item.status==="rejected"} onClick={()=>void moderate(item,"rejected")}>Reject</LocalizedElement></>}<LocalizedElement as="button" disabled={busy} onClick={() => void edit(item)}>{section.readOnly?"View":"Edit"}</LocalizedElement><LocalizedElement as="button" disabled={busy} className="cms-danger" onClick={() => { setDeleting(item); setFormError(''); }}>Delete</LocalizedElement></LocalizedElement></LocalizedElement>
      </article>)}</LocalizedElement> : <LocalizedElement as="div" className="cms-record-list">{visible.map(item => <article key={item.id}>
        <LocalizedElement as="div"><LocalizedElement as="strong">{recordName(item)}</LocalizedElement><LocalizedElement as="small">{String(item.slug ?? item.path ?? item.key ?? '')}</LocalizedElement>{section.collection==='expertReviews'&&<><LocalizedElement as="small">{String(item.status || 'draft')}</LocalizedElement>{item.status==='published'&&<LocalizedElement as="a" href={'/reviews/'+item.slug} target="_blank" rel="noreferrer">View review ↗</LocalizedElement>}</>}{section.moderation&&<LocalizedElement as="small">{String(item.status??'pending')}</LocalizedElement>}</LocalizedElement>
        <LocalizedElement as="div" className="cms-actions">{section.moderation&&<><LocalizedElement as="button" disabled={busy||item.status==="approved"} onClick={()=>void moderate(item,"approved")}>Approve</LocalizedElement><LocalizedElement as="button" disabled={busy||item.status==="rejected"} onClick={()=>void moderate(item,"rejected")}>Reject</LocalizedElement></>}<LocalizedElement as="button" disabled={busy} onClick={() => void edit(item)}>{section.readOnly?"View":"Edit"}</LocalizedElement><LocalizedElement as="button" disabled={busy} className="cms-danger" onClick={() => { setDeleting(item); setFormError(''); }}>Delete</LocalizedElement></LocalizedElement>
      </article>)}</LocalizedElement>}
    </section>
    {open && <AdminDialog title={(section.readOnly?'View ':editing ? 'Edit ' : 'Add ') + (hero ? 'hero slide' : section.label.toLowerCase())} busy={busy} onClose={() => setOpen(false)}>
      <form className="cms-form" onSubmit={submit}>
        {!section.readOnly && <LocalizedElement as="p" className="cms-help">Only fields marked * are required. Other details can be left blank, added or cleared later. {editing ? 'Save changes updates this record without creating a duplicate.' : 'You can reopen any saved record using Edit.'}</LocalizedElement>}
        {section.collection === 'tractors' ? <TractorFields form={form} sources={sources} disabled={busy||Boolean(section.readOnly)} onChange={change} onImport={values=>setForm(current=>({...current,...values}))} onBusy={setUploading} onError={setFormError}/> : <LocalizedElement as="div" className="cms-fields">{section.fields.map(field => field.type === 'image' ?
          <AdminImageField key={field.key} label={field.label} value={String(form[field.key] ?? '')} folder={section.collection} disabled={busy||Boolean(section.readOnly)}
            onChange={value => change(field.key, value)} onBusy={setUploading} onError={setFormError}/> :
          <LocalizedElement as="label" key={field.key} className={field.type === 'textarea' ? 'cms-wide' : ''}>{field.label}{field.required ? <LocalizedElement as="span" aria-hidden="true"> *</LocalizedElement> : <LocalizedElement as="small" className="cms-optional"> (optional)</LocalizedElement>}
            {field.type === 'select' ? <LocalizedElement as="select" disabled={busy||Boolean(section.readOnly)} required={field.required} value={String(form[field.key]??'')} onChange={event=>change(field.key,event.target.value)}>
                <LocalizedElement as="option" value="">Select {field.label.toLowerCase()}</LocalizedElement>
                {adminSelectOptions(field, form[field.key], sources).map(option=><LocalizedElement as="option" key={option.value} value={option.value}>{option.label}</LocalizedElement>)}
              </LocalizedElement> : field.type === 'textarea' ? <LocalizedElement as="textarea" required={field.required} disabled={busy||Boolean(section.readOnly)} rows={field.key === 'content' ? 8 : 3} value={String(form[field.key] ?? '')} onChange={event => change(field.key, event.target.value)}/> :
              field.type === 'boolean' ? <LocalizedElement as="input" type="checkbox" disabled={busy||Boolean(section.readOnly)} checked={Boolean(form[field.key])} onChange={event => change(field.key, event.target.checked)}/> :
              <LocalizedElement as="input" disabled={busy||Boolean(section.readOnly)} required={field.required} type={field.key === 'backgroundColor' ? 'color' : field.type === 'number' ? 'number' : field.key === 'email' ? 'email' : 'text'}
                min={field.key === 'order' || field.key === 'rating' ? 1 : field.type === 'number' ? 0 : undefined}
                max={field.key === 'rating' ? 5 : field.key === 'score' ? 10 : undefined} step={field.key === 'order' ? 1 : field.type === 'number' ? 'any' : undefined}
                value={String(form[field.key] ?? '')} onChange={event => change(field.key, field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)}/>}
          </LocalizedElement>)}</LocalizedElement>}
        {hero && <LocalizedElement as="p" className="cms-help">Position 1 appears first. Removing the image keeps a blank slide; deleting the record removes that slide from the carousel.</LocalizedElement>}
        {formError && <LocalizedElement as="div" className="cms-error" role="alert">{formError}</LocalizedElement>}
        <LocalizedElement as="div" className="cms-form-footer"><LocalizedElement as="button" type="button" disabled={busy} onClick={() => setOpen(false)}>{section.readOnly?"Close":"Cancel"}</LocalizedElement>
          {!section.readOnly&&<LocalizedElement as="button" className="cms-primary" disabled={busy}>{uploading ? 'Uploading…' : saving ? 'Saving…' : editing ? 'Save changes' : hero ? 'Save slide' : section.collection==='tractors' ? 'Save tractor' : 'Save record'}</LocalizedElement>}</LocalizedElement>
      </form>
    </AdminDialog>}
    {deleting && <AdminDialog title="Delete record?" busy={busy} onClose={() => setDeleting(null)}>
      <LocalizedElement as="div" className="cms-form"><LocalizedElement as="p">Remove “{recordName(deleting)}”? This will remove it from the website.</LocalizedElement>
        {formError && <LocalizedElement as="div" className="cms-error" role="alert">{formError}</LocalizedElement>}
        <LocalizedElement as="div" className="cms-form-footer"><LocalizedElement as="button" disabled={busy} onClick={() => setDeleting(null)}>Cancel</LocalizedElement><LocalizedElement as="button" className="cms-primary" disabled={busy} onClick={() => void remove()}>{busy ? 'Deleting…' : 'Confirm delete'}</LocalizedElement></LocalizedElement>
      </LocalizedElement>
    </AdminDialog>}
  </LocalizedElement>;
}

