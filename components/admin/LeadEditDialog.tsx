'use client';
import { useState, type FormEvent } from 'react';
import { updateLeadDetails, type Lead } from '@/services/leads';
import { AdminDialog } from './AdminDialog';

const fields = [
  { key: 'name', label: 'Name', required: true }, { key: 'phone', label: 'Phone', required: true },
  { key: 'email', label: 'Email' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'message', label: 'Message' },
] as const;
export function LeadEditDialog({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (lead: Lead) => void }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(field => [field.key, lead[field.key] ?? ''])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError('');
    try {
      const changes = Object.fromEntries(fields.filter(field => String(lead[field.key] ?? '') !== form[field.key]).map(field => [field.key, form[field.key]]));
      onSave(await updateLeadDetails(lead.id, changes));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save details.'); }
    finally { setSaving(false); }
  }
  return <AdminDialog title="Edit lead details" busy={saving} onClose={onClose}><form className="cms-form" onSubmit={submit}>
    <p className="cms-help">Only Name and Phone are required. Updating contact details keeps the enquiry source, status and internal notes.</p>
    <div className="cms-fields">{fields.map(field => <label key={field.key} className={field.key === 'message' ? 'cms-wide' : ''}>{field.label}{'required' in field ? ' *' : ' (optional)'}
      {field.key === 'message' ? <textarea rows={4} disabled={saving} value={form[field.key]} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}/> : <input required={'required' in field} disabled={saving} type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'} value={form[field.key]} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}/>}
    </label>)}</div>
    {error && <p className="cms-error" role="alert">{error}</p>}
    <div className="cms-form-footer"><button type="button" disabled={saving} onClick={onClose}>Cancel</button><button className="cms-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form></AdminDialog>;
}
