'use client';
import { useId, useState } from 'react';
import { tractorBaseFields, tractorSpecGroups, tractorSpecFields, tractorSpecificationSources, type TractorSpecField } from '@/config/tractor-specifications';
import type { AdminField } from '@/config/admin-sections';
import type { AdminRecord } from '@/services/admin';
import { parseTractorSpecificationCsv, tractorSpecificationTemplate } from '@/lib/tractor-specification-csv';
import { specificationLabel } from '@/lib/tractor-specifications';
import { AdminImageField } from './AdminImageField';
import { adminSelectOptions } from '@/lib/admin-form';
import '@/app/tractor-specifications.css';

export function TractorFields({ form, sources, disabled, onChange, onImport, onBusy, onError }: {
  form: Record<string, unknown>; sources: Record<string, AdminRecord[]>; disabled: boolean;
  onChange: (key: string, value: unknown) => void; onImport: (values: Record<string, unknown>) => void;
  onBusy: (value: boolean) => void; onError: (message: string) => void;
}) {
  const prefix = useId();
  const [preview, setPreview] = useState<ReturnType<typeof parseTractorSpecificationCsv> | null>(null);
  const [importError, setImportError] = useState('');
  const [notice, setNotice] = useState('');
  async function read(file?: File) {
    if (!file) return;
    setImportError(''); setPreview(null); setNotice(''); onBusy(true);
    try {
      if (file.size > 65536 || !file.name.toLowerCase().endsWith('.csv')) throw new Error('Choose a .csv specification file under 64 KB.');
      setPreview(parseTractorSpecificationCsv(await file.text()));
    } catch (reason) { setImportError(reason instanceof Error ? reason.message : 'Unable to read the CSV.'); }
    finally { onBusy(false); }
  }
  function fieldInput(field: AdminField | TractorSpecField) {
    if (field.type === 'image') return <AdminImageField key={field.key} label={field.label} value={String(form[field.key] ?? '')} folder="tractors" disabled={disabled} onChange={value => onChange(field.key, value)} onBusy={onBusy} onError={onError} />;
    const spec = field as TractorSpecField;
    const base = field as AdminField;
    const label = spec.unit ? specificationLabel(spec) : field.label;
    const id = prefix + '-' + field.key;
    const value = form[field.key];
    const stringValue = Array.isArray(value) ? value.join('\n') : String(value ?? '');
    const choices = adminSelectOptions(base, value, sources);
    return <label key={field.key} htmlFor={id} className={['textarea', 'lines'].includes(field.type ?? '') ? 'cms-wide' : ''}>{label}{base.required ? ' *' : ''}
      {field.type === 'boolean' ? <input id={id} type="checkbox" checked={value === true} disabled={disabled} onChange={event => onChange(field.key, event.target.checked)}/> : field.type === 'select' ? <select id={id} required={base.required} disabled={disabled} value={stringValue} onChange={event => onChange(field.key, event.target.value)}><option value="">Not specified</option>{choices?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : ['textarea', 'lines'].includes(field.type ?? '') ? <textarea id={id} rows={field.type === 'lines' ? 4 : 3} disabled={disabled} maxLength={12000} value={stringValue} onChange={event => onChange(field.key, event.target.value)} aria-describedby={spec.help ? id + '-help' : undefined} /> : <input id={id} required={base.required} disabled={disabled} type={field.type === 'number' ? 'number' : field.key === 'specificationSourceUrl' ? 'url' : 'text'} min={spec.min ?? (field.type === 'number' ? 0 : undefined)} step={spec.integer ? 1 : field.type === 'number' ? 'any' : undefined} maxLength={600} value={stringValue} onChange={event => onChange(field.key, field.type === 'number' && event.target.value !== '' ? Number(event.target.value) : event.target.value)} aria-describedby={spec.help ? id + '-help' : undefined} />}
      {spec.help && <small id={id + '-help'} className="tractor-field-help">{spec.help}</small>}
    </label>;
  }
  return <div className="tractor-spec-editor" onInvalidCapture={event => { const details = (event.target as HTMLElement).closest('details'); if (details) details.open = true; }}>
    <p className="tractor-spec-intro">Only Brand and Model are required. All specifications, prices and images are optional. You can edit or clear them after saving. Blank specifications appear as “Not provided” on the website. Popular and Upcoming control the homepage tabs. Available new models appear in Latest automatically. Enable In demand only when appropriate.</p>
    <div className="cms-fields">{tractorBaseFields.map(fieldInput)}</div>
    <section className="tractor-csv-import" aria-label="Upload tractor specifications"><div><h3>Upload specifications</h3><p>Use a two-column CSV for this tractor. Preview it before applying. Blank values are ignored.</p></div><div className="tractor-import-actions"><a download="tractor-specifications-template.csv" href={'data:text/csv;charset=utf-8,' + encodeURIComponent(tractorSpecificationTemplate())}>Download CSV template ↓</a><label>Choose CSV<input type="file" accept=".csv,text/csv" disabled={disabled} onChange={event => { void read(event.target.files?.[0]); event.target.value = ''; }} /></label></div>
      {importError && <p className="cms-error" role="alert">{importError}</p>}
      {notice && <p className="cms-notice" role="status">{notice}</p>}
      {preview && <div className="tractor-import-preview"><h4>{Object.keys(preview.values).length} specifications ready to apply</h4><dl>{Object.entries(preview.values).map(([key, value]) => <div key={key}><dt>{tractorSpecFields.find(field => field.key === key)?.label}</dt><dd>{Array.isArray(value) ? value.join(' · ') : String(value)}</dd></div>)}</dl><p>This replaces only the listed fields in the form. Other fields stay unchanged.{preview.skipped ? ' ' + preview.skipped + ' blank values skipped.' : ''}</p><div className="tractor-import-actions"><button type="button" disabled={disabled} onClick={() => setPreview(null)}>Discard preview</button><button className="cms-primary" type="button" disabled={disabled} onClick={() => { onImport(preview.values); setNotice('Specifications applied to the form. Review them, then save the tractor.'); setPreview(null); }}>Apply to form</button></div></div>}
    </section>
    {tractorSpecGroups.map((group, index) => <details className="tractor-spec-group" key={group.key} open={index === 0}><summary><span>{group.title}</span><small>{group.fields.filter(field => { const value = form[field.key]; return value !== undefined && value !== '' && (!Array.isArray(value) || value.length); }).length}/{group.fields.length} filled</small></summary><p>{group.description}</p><div className="cms-fields">{group.fields.map(fieldInput)}</div></details>)}
    <p className="tractor-spec-references">Specification checklist based on official manufacturer pages: {tractorSpecificationSources.map((source, index) => <span key={source.url}>{index ? ' · ' : ''}<a href={source.url} target="_blank" rel="noreferrer">{source.title.split(' ')[0]}</a></span>)}. Enter the values for your exact model and variant; these links do not fill values automatically.</p>
  </div>;
}
