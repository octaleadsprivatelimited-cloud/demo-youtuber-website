'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useSiteSearch } from '@/hooks/useSiteSearch';
import { SearchBrowse, SearchResults, SearchWarning } from './SearchResults';
import '@/app/site-search.css';

function SearchDialog({ onClose, referenceStyle = false }: { onClose: () => void; referenceStyle?: boolean }) {
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const search = useSiteSearch(query);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    input.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!search.ready) { input.current?.focus(); return; }
    router.push('/search?q=' + encodeURIComponent(query.trim()));
    onClose();
  }
  return createPortal(<dialog ref={dialog} id="site-search-dialog" className={'site-search-dialog' + (referenceStyle ? ' site-search-dialog-reference' : '')} aria-labelledby="site-search-heading"
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose();
    }}>
    <div className="site-search-dialog-head"><div><p>RJ TRACTOR TECHS</p><h2 id="site-search-heading">What are you looking for?</h2></div><button type="button" className="site-search-close" aria-label="Close search" onClick={onClose}>×</button></div>
    <form className="site-search-form" role="search" onSubmit={submit}>
      <span className="site-search-glass" aria-hidden="true" />
      <input ref={input} autoFocus aria-label="Search models, brands and topics" aria-describedby="site-search-help" type="search" enterKeyHint="search" autoComplete="off" maxLength={120} placeholder="Model, brand, HP or topic…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === 'ArrowDown') { const first = dialog.current?.querySelector<HTMLAnchorElement>('.site-search-list a'); if (first) { event.preventDefault(); first.focus(); } }
      }} />
      {query && <button className="site-search-clear" type="button" aria-label="Clear search" onClick={() => { setQuery(''); input.current?.focus(); }}>×</button>}
      <button className="site-search-submit" type="submit" disabled={!search.ready}>Search</button>
    </form>
    <p id="site-search-help" className="site-search-help">Search published models, brands, articles, videos and more.</p>
    <div className="site-search-dialog-body">
      <SearchWarning unavailable={search.unavailable} retry={search.retry} />
      <p className="site-search-status" role="status">{!search.ready ? 'Enter at least 2 letters or numbers to start.' : search.pending ? 'Searching…' : search.results.length ? `${search.results.length} ${search.results.length === 1 ? 'match' : 'matches'} found` : `No matches for “${query.trim()}”. Try a model number or fewer words.`}</p>
      {!search.ready ? <SearchBrowse onNavigate={onClose} /> : !search.pending && <>
        <SearchResults items={search.results.slice(0, 6)} onNavigate={onClose} />
        {search.results.length > 0 ? <a className="site-search-all" href={'/search?q=' + encodeURIComponent(query.trim())} onClick={onClose}>View all {search.results.length} results<span aria-hidden="true">→</span></a> : <SearchBrowse onNavigate={onClose} />}
      </>}
    </div>
    <div className="site-search-dialog-foot">Search across the website<span>Esc to close</span></div>
  </dialog>, document.body);
}

export function HeaderSearch({ onOpen, wide = false }: { onOpen?: () => void; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className={'round-action site-search-trigger' + (wide ? ' site-search-trigger-wide' : '')} aria-label="Search website" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? 'site-search-dialog' : undefined} onClick={() => { onOpen?.(); setOpen(true); }}><span aria-hidden="true" className="site-search-glass" />{wide && <span className="site-search-trigger-label">Search for tractor</span>}</button>{open && <SearchDialog referenceStyle={wide} onClose={() => setOpen(false)} />}</>;
}
