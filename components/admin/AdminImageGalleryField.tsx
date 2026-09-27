'use client';
import { AdminImageField } from './AdminImageField';

export function AdminImageGalleryField({ value, onChange, ...props }: {
  label: string; value: unknown; folder: string; disabled: boolean;
  onChange: (value: string[]) => void; onBusy: (busy: boolean) => void; onError: (error: string) => void;
}) {
  const photos = Array.isArray(value) ? value as string[] : [];
  return <div className="cms-wide"><h3>{props.label}</h3><p>Add photos one at a time. Each image must be under 1 MB. Changes are applied when you save.</p>
    {[...photos, ''].map((source, index) => <AdminImageField {...props} key={index} label={`Photo ${index + 1}`} value={source} onChange={image => { const next = [...photos]; next[index] = image; onChange(next); }}/>) }
  </div>;
}
