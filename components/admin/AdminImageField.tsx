'use client';
import { useId, useState } from 'react';
import { uploadAdminImage } from '@/services/admin';
export function AdminImageField({ label, value, folder, disabled, onChange, onBusy, onError }: {
  label: string; value: string; folder: string; disabled: boolean;
  onChange: (value: string) => void; onBusy: (busy: boolean) => void; onError: (error: string) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [failedSource, setFailedSource] = useState('');
  async function choose(file?: File) {
    if (!file) return;
    setUploading(true); onBusy(true); onError(''); setFailedSource('');
    try {
      const source = await uploadAdminImage(file, folder);
      // Confirm the saved image is decodable before allowing the record to save.
      const preview = new Image(); preview.src = source;
      await preview.decode();
      onChange(source);
    } catch (error) { onError(error instanceof Error ? error.message : 'Image upload failed. Please try again.'); }
    finally { setUploading(false); onBusy(false); }
  }
  return <div className="cms-image-field">
    <label htmlFor={id}>{label}</label>
    {value && <div className="cms-image-preview">{failedSource === value ? <p>Image unavailable. Choose a replacement.</p> :
      <img key={value} src={value} alt={label + ' preview'} onError={() => setFailedSource(value)}/>}</div>}
    <div className="cms-upload"><strong>{uploading ? 'Uploading image…' : value ? 'Replace image' : 'Choose an image'}</strong>
      <span>JPG, PNG, WebP or GIF · up to 8 MB</span>
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled || uploading}
        onChange={event => { void choose(event.target.files?.[0]); event.target.value = ''; }}/></div>
    {value && <button className="cms-text-button" type="button" disabled={disabled || uploading} onClick={() => { onChange(''); setFailedSource(''); }}>Remove image</button>}
  </div>;
}
