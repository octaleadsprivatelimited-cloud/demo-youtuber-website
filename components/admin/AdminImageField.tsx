'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useId, useState } from 'react';
import { stageAdminImage, releaseStagedImage } from '@/lib/staged-media';
export function AdminImageField({ label, value, disabled, onChange, onBusy, onError }: {
  label: string; value: string; folder: string; disabled: boolean;
  onChange: (value: string) => void; onBusy: (busy: boolean) => void; onError: (error: string) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [failedSource, setFailedSource] = useState('');
  useEffect(() => () => releaseStagedImage(value), [value]);
  async function choose(file?: File) {
    if (!file) return;
    setUploading(true); onBusy(true); onError(''); setFailedSource('');
    try {
      const source = await stageAdminImage(file);
      // Preview locally; the image is stored atomically when the record is saved.
      const preview = new Image(); preview.src = source;
      try { await preview.decode(); } catch (error) { releaseStagedImage(source); throw error; }
      onChange(source);
    } catch (error) { onError(error instanceof Error ? error.message : 'Image upload failed. Please try again.'); }
    finally { setUploading(false); onBusy(false); }
  }
  return <LocalizedElement as="div" className="cms-image-field">
    <LocalizedElement as="label" htmlFor={id}>{label}</LocalizedElement>
    {value && <LocalizedElement as="div" className="cms-image-preview">{failedSource === value ? <LocalizedElement as="p">Image unavailable. Choose a replacement.</LocalizedElement> :
      <LocalizedElement as="img" key={value} src={value} alt={label + ' preview'} onError={() => setFailedSource(value)}/>}</LocalizedElement>}
    <LocalizedElement as="div" className="cms-upload"><LocalizedElement as="strong">{uploading ? 'Preparing image…' : value ? 'Replace image' : 'Choose an image'}</LocalizedElement>
      <LocalizedElement as="span">JPG, PNG, WebP or GIF · under 1 MB (1,000,000 bytes) · automatically compressed</LocalizedElement>
      <LocalizedElement as="input" id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled || uploading}
        onChange={event => { void choose(event.target.files?.[0]); event.target.value = ''; }}/></LocalizedElement>
    <small>Images upload when you save. Removing or replacing an image permanently deletes its unused upload after saving.</small>
    {value && <LocalizedElement as="button" className="cms-text-button" type="button" disabled={disabled || uploading} onClick={() => { onChange(''); setFailedSource(''); }}>Remove image</LocalizedElement>}
  </LocalizedElement>;
}
