'use client';
import { Fragment, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro } from '@/components/PublicPageParts';
import { SpecificationValue } from '@/components/TractorSpecifications';
import { comparisonGroups, specificationSource } from '@/lib/tractor-specifications';
import { comparisonSelection, chooseComparisonTractor, comparisonUrl } from '@/lib/tractor-comparison';
import { subscribeComparisonCatalog } from '@/services/comparison';
import type { Tractor } from '@/types/content';
import '@/app/tractor-specifications.css';

function CompareContent() {
  const params = useSearchParams(); const router = useRouter(); const query = params.toString();
  const [catalog, setCatalog] = useState<Tractor[]>([]);
  const [slots, setSlots] = useState(() => comparisonSelection(params.getAll('tractor')));
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0); const [filter, setFilter] = useState('');
  const [onlyDifferences, setOnlyDifferences] = useState(false); const [shared, setShared] = useState('');
  useEffect(() => { setSlots(comparisonSelection(new URLSearchParams(query).getAll('tractor'))); setShared(''); }, [query]);
  useEffect(() => {
    setLoading(true); setError('');
    return subscribeComparisonCatalog(items => { setCatalog(items); setError(''); setLoading(false); }, reason => { setError(reason.message); setLoading(false); });
  }, [attempt]);
  function choose(index: number, id: string) {
    const next = chooseComparisonTractor(slots, index, id); setSlots(next); setShared('');
    router.replace(comparisonUrl(next), { scroll: false });
  }
  const tractors = slots.flatMap(id => { const item = catalog.find(item => item.id === id); return item ? [item] : []; });
  const groups = comparisonGroups(tractors, onlyDifferences);
  const tokens = filter.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const missing = slots.filter(id => id && !catalog.some(item => item.id === id));
  async function share() {
    try { await navigator.clipboard.writeText(window.location.origin + comparisonUrl(slots)); setShared('Comparison link copied.'); }
    catch { setShared('Copy the comparison URL from your address bar to share it.'); }
  }
  return <PublicShell><main className="compare-page"><PageIntro eyebrow="SIDE-BY-SIDE RESEARCH" title="Compare the details. Find your fit." description="Choose two or three tractors and compare the specifications saved for each variant. No ratings or winner claims—just the listed information." /><section className="comparison-workspace">
    <div className="comparison-find"><label htmlFor="compare-model-filter">Find models<input id="compare-model-filter" type="search" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Search model or brand…" /></label><p>{loading ? 'Loading published models…' : catalog.length + ' published ' + (catalog.length === 1 ? 'model' : 'models')}<span>Selections update automatically when the catalog changes.</span></p></div>
    {error && <div className="error-state" role="alert">Unable to load the latest catalog. {error}<button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button></div>}
    <div className="comparison-pickers">{[0, 1, 2].map(index => {
      const selected = catalog.find(item => item.id === slots[index]);
      const choices = catalog.filter(item => item.id === slots[index] || (!slots.includes(item.id) && tokens.every(token => (item.name + ' ' + item.brandName + ' ' + (item.variant ?? '')).toLowerCase().includes(token))));
      return <div className="comparison-picker" key={index}><div className="comparison-picker-label"><label htmlFor={'compare-tractor-' + index}>TRACTOR 0{index + 1}{index === 2 ? ' · OPTIONAL' : ''}</label>{slots[index] && <button type="button" onClick={() => choose(index, '')} aria-label={'Remove tractor ' + (index + 1)}>×</button>}</div>
        <select id={'compare-tractor-' + index} value={slots[index]} disabled={loading || Boolean(error)} onChange={event => choose(index, event.target.value)}><option value="">Choose a tractor</option>{!selected && slots[index] && <option value={slots[index]}>Model no longer available</option>}{choices.map(item => <option key={item.id} value={item.id}>{item.name}{item.variant && !item.name.includes(item.variant) ? ' · ' + item.variant : ''}</option>)}</select>
        {selected ? <div className="comparison-picked-model">{selected.image ? <img src={selected.image} alt="" /> : <span aria-hidden="true">0{index + 1}</span>}<div><strong>{selected.name}</strong><a href={'/tractor/' + encodeURIComponent(selected.brandSlug) + '/' + encodeURIComponent(selected.slug)}>View model ↗</a></div></div> : <p>{!loading && filter && !choices.length ? 'No models match this search.' : index === 2 ? 'Add a third model to your shortlist.' : 'Choose a model to see its specifications.'}</p>}
      </div>;
    })}</div>
    {!loading && !error && missing.length > 0 && <p className="comparison-notice" role="status">A selected model was removed or is no longer published. Choose a replacement above.</p>}
    {loading ? <p role="status" className="detail-loading">Preparing comparison…</p> : error ? null : tractors.length < 2 ? <div className="empty-state"><h3>{catalog.length < 2 ? 'At least two published models are needed.' : 'Choose two tractors to start.'}</h3><p>{catalog.length < 2 ? 'Models and their specifications appear here after they are saved in the tractor catalog.' : 'Select a different model in each slot. Your selections are kept in the page link.'}</p><a href="/tractors">Explore the catalog →</a></div> : <>
      <div className="comparison-toolbar"><label><input type="checkbox" checked={onlyDifferences} onChange={event => setOnlyDifferences(event.target.checked)} /> Show only differences</label><div><button type="button" onClick={() => { setSlots(['', '', '']); router.replace('/compare', { scroll: false }); }}>Clear comparison</button><button type="button" onClick={() => void share()}>Copy comparison link ↗</button></div></div>{shared && <p className="comparison-notice" role="status">{shared}</p>}
      <p className="comparison-guidance">Highlighted cells contain different provided values. Missing information is not treated as a difference. <span>On smaller screens, scroll the table sideways.</span></p>
      <div className="comparison-table-scroll" role="region" aria-label="Tractor specification comparison" tabIndex={0}><table className="tractor-comparison-table"><caption>Specifications for {tractors.map(item => item.name).join(', ')}</caption><thead><tr><th scope="col">Specification</th>{tractors.map(item => <th scope="col" key={item.id}>{item.name}<small>{item.variant || item.brandName}</small></th>)}</tr></thead><tbody>{groups.map(group => <Fragment key={group.key}><tr className="comparison-group-heading"><th colSpan={tractors.length + 1} scope="rowgroup">{group.title}</th></tr>{group.rows.map(row => <tr key={row.key}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={tractors[index].id} className={row.different ? 'spec-different' : undefined}><SpecificationValue value={value} list={row.list} /></td>)}</tr>)}</Fragment>)}</tbody></table></div>
      {!groups.length && <p className="comparison-notice">No differences were found in the provided specifications. Some values may be missing. Turn off the filter to see all fields.</p>}
      <div className="comparison-source-cards">{tractors.map(item => <div key={item.id}><strong>{item.name}</strong>{specificationSource(item) ? <a href={specificationSource(item)} target="_blank" rel="noreferrer">Manufacturer specification source ↗</a> : <span>No source link provided.</span>}<a href={'/tractor/' + encodeURIComponent(item.brandSlug) + '/' + encodeURIComponent(item.slug)}>Full model details →</a></div>)}</div>
      <p className="comparison-guidance">Confirm the exact variant, optional equipment, warranty terms and current prices with the manufacturer or dealer.</p>
    </>}
  </section></main></PublicShell>;
}
export default function ComparePage() { return <Suspense fallback={<p role="status">Loading comparison…</p>}><CompareContent /></Suspense>; }
