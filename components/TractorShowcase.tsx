'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Tractor } from '@/types/content';
import { selectShowcaseTractors, tractorShowcaseTabs, tractorShowcaseLabels, tractorShowcaseLinks, type TractorShowcaseTab } from '@/lib/tractor-showcase';
import '@/app/tractor-showcase.css';

export function ShowcaseTractorCard({ tractor, design = 'default' }: { tractor: Tractor; design?: 'default' | 'reference' }) {
  const [failedImage, setFailedImage] = useState('');
  const href = '/tractor/' + encodeURIComponent(tractor.brandSlug) + '/' + encodeURIComponent(tractor.slug);
  return <article className="showcase-tractor-card">
    <a href={href} className="showcase-tractor-photo" aria-label={'View ' + tractor.name}>
      {tractor.image && tractor.image !== failedImage ? <img src={tractor.image} alt={tractor.name} loading="lazy" width={480} height={280} onError={() => setFailedImage(tractor.image || '')}/> : <span>Image not added</span>}
    </a>
    {tractor.inDemand === true && <span className="showcase-demand"><img src="/icons/tabler/flame.svg" alt="" width={13} height={13}/> In demand</span>}
    <div className="showcase-tractor-body"><h3><a href={href}>{tractor.name}</a></h3>
      <div className="showcase-specs"><span><img src="/icons/tabler/engine.svg" alt="" width={16} height={16}/>{tractor.hp > 0 ? tractor.hp + ' HP' : 'HP not listed'}</span><span><img src="/icons/tabler/settings.svg" alt="" width={16} height={16}/>{Number(tractor.engineCapacityCc) > 0 ? tractor.engineCapacityCc + ' CC' : 'CC not listed'}</span></div>
      {design === 'reference' ? <a className="showcase-detail" href={href}>View specifications<img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a> : <a className="showcase-price" href={href + '#price'} aria-label={'Check tractor price for ' + tractor.name}>Check Tractor Price</a>}
    </div>
  </article>;
}

function CatalogDiscovery({ tab }: { tab: TractorShowcaseTab }) {
  return <div className="showcase-discovery">
    <div className="showcase-discovery-copy">
      <p className="showcase-availability">No {tractorShowcaseLabels[tab].toLowerCase()} tractors listed yet.</p>
      <h3>The right tractor starts<br />with the work you do.</h3>
      <p>Choose a power range to explore the catalog. New models appear as they are published.</p>
      <div className="showcase-power-links" aria-label="Browse tractors by horsepower">
        <a href="/tractors?minHp=0&maxHp=29">Under 30 HP <img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a>
        <a href="/tractors?minHp=30&maxHp=45">30–45 HP <img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a>
        <a href="/tractors?minHp=45&maxHp=60">45–60 HP <img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a>
        <a href="/tractors?minHp=61">Over 60 HP <img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a>
      </div>
    </div>
    <figure><img src="/hero/mahindra-575-di-xp-plus.webp" alt="Mahindra tractor in a field, an illustration for the research guide" loading="lazy" width={600} height={400}/><figcaption><span>Tractor research, made clearer</span><span>Explore. Compare. Decide.</span></figcaption></figure>
  </div>;
}

export function TractorShowcase({ title, tractors, loading = false, error = '', onRetry, design = 'default' }: { design?: 'default' | 'reference'; title: string; tractors: Tractor[]; loading?: boolean; error?: string; onRetry?: () => void }) {
  const [tab, setTab] = useState<TractorShowcaseTab>('popular');
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const row = useRef<HTMLDivElement>(null);
  const items = selectShowcaseTractors(tractors, tab).slice(0, 5);
  useEffect(() => { if (row.current) row.current.scrollLeft = 0; }, [tab]);
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault(); setTab(tractorShowcaseTabs[next]); buttons.current[next]?.focus();
  }
  return <section className={"tractor-showcase" + (design === 'reference' ? ' showcase-reference' : '')} aria-labelledby={id + '-heading'}><div className="tractor-showcase-inner">
    <div className="showcase-heading"><div><p>EXPLORE THE CATALOG</p><h2 id={id + '-heading'}>{title}</h2></div><a href="/tractors">All tractors <img src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></a></div>
    <div className="showcase-tabs" role="tablist" aria-label="Browse tractors">{tractorShowcaseTabs.map((key, index) => <button key={key} ref={element => { buttons.current[index] = element; }} id={id + '-' + key} type="button" role="tab" aria-controls={id + '-panel'} aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onKeyDown={event => navigate(event, index)} onClick={() => setTab(key)}>{tractorShowcaseLabels[key]}</button>)}</div>
    <div id={id + '-panel'} role="tabpanel" aria-labelledby={id + '-' + tab} tabIndex={0} aria-busy={loading}>
      {loading ? <p className="showcase-message" role="status">Loading tractors…</p> : error ? <div className="showcase-message" role="alert"><p>Unable to load tractors right now.</p>{onRetry && <button type="button" onClick={onRetry}>Try again</button>}</div> : items.length ? <div className="showcase-row" ref={row}>{items.map(tractor => <ShowcaseTractorCard key={tractor.id} tractor={tractor} design={design}/>)}</div> : <CatalogDiscovery tab={tab} />}
    </div>
    {!loading && !error && <div className="showcase-footer"><a href={tractorShowcaseLinks[tab]}>View All {tractorShowcaseLabels[tab]} Tractors</a></div>}
  </div></section>;
}
