'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
export function AdminDialog({ title, busy, onClose, children }: { title: string; busy?: boolean; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; focus?.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} className="cms-dialog" aria-label={title}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <LocalizedElement as="div" className="cms-dialog-header"><LocalizedElement as="div"><LocalizedElement as="p">CONTENT EDITOR</LocalizedElement><LocalizedElement as="h2">{title}</LocalizedElement></LocalizedElement>
      <LocalizedElement as="button" type="button" className="cms-icon-button" disabled={busy} onClick={onClose} aria-label="Close editor">×</LocalizedElement></LocalizedElement>
    {children}
  </dialog>, document.body);
}
