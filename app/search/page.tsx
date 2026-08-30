'use client';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro } from '@/components/PublicPageParts';
import { SearchBrowse, SearchResults, SearchWarning } from '@/components/SearchResults';
import { useSiteSearch } from '@/hooks/useSiteSearch';
import { searchCategories, type SearchCategory } from '@/utils/site-search';
import '@/app/site-search.css';

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = (params.get('q') ?? '').slice(0, 120);
  const [query, setQuery] = useState(initial);
  const [category, setCategory] = useState<SearchCategory>('All');
  const [shown, setShown] = useState(20);
  const input = useRef<HTMLInputElement>(null);
  const search = useSiteSearch(query);
  useEffect(() => { setQuery(initial); }, [initial]);
  useEffect(() => { setShown(20); }, [query, category]);
  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(query.trim() ? '/search?q=' + encodeURIComponent(query.trim()) : '/search', { scroll: false });
  }
  const results = category === 'All' ? search.results : search.results.filter(item => item.category === category);
  return <PublicShell><main className="site-search-page"><PageIntro eyebrow="SEARCH RJ TRACTOR TECHS" title="Find your next answer." description="Find models, brands and practical farming information. Results appear as you type.">
    <form className="site-search-form" role="search" onSubmit={submit}><span className="site-search-glass" aria-hidden="true" /><input ref={input} aria-label="Search the website" type="search" enterKeyHint="search" autoComplete="off" maxLength={120} value={query} onChange={event => { setQuery(event.target.value); setCategory('All'); }} placeholder="Model, brand, horsepower or topic…" />{query && <button className="site-search-clear" type="button" aria-label="Clear search" onClick={() => { setQuery(''); setCategory('All'); router.replace('/search', { scroll: false }); input.current?.focus(); }}>×</button>}<button className="site-search-submit" disabled={!search.ready}>Search</button></form>
  </PageIntro><section className="site-search-workspace" aria-label="Search results">
    <SearchWarning unavailable={search.unavailable} retry={search.retry} />
    {!search.ready ? <><p className="site-search-status" role="status">Enter at least 2 letters or numbers. You can search by model number, brand, horsepower, topic or dealer location.</p><SearchBrowse /></> : <>
      <div className="site-search-filters" role="group" aria-label="Filter search results">{searchCategories.map(value => { const count = value === 'All' ? search.results.length : search.results.filter(item => item.category === value).length; return <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}{!search.pending && <span>{count}</span>}</button>; })}</div>
      <p className="site-search-status" role="status">{search.pending ? 'Searching published content…' : `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”${category !== 'All' ? ' in ' + category.toLowerCase() : ''}`}</p>
      {!search.pending && (results.length ? <><SearchResults items={results.slice(0, shown)} />{shown < results.length && <button className="site-search-more" onClick={() => setShown(value => value + 20)}>Show more results ({results.length - shown} remaining)</button>}</> : <div className="site-search-empty"><h2>No matching {category === 'All' ? 'content' : category.toLowerCase()} yet.</h2><p>Check the spelling or try a shorter phrase. Only published content is shown.</p>{category !== 'All' && <button className="site-search-more" onClick={() => setCategory('All')}>Search all sections</button>}<SearchBrowse /></div>)}
    </>}
  </section></main></PublicShell>;
}
export default function SearchPage() { return <Suspense fallback={<p className="site-search-status" role="status">Loading search…</p>}><SearchContent /></Suspense>; }
