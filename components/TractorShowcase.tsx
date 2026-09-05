'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Tractor } from '@/types/content';
import { selectShowcaseTractors, tractorShowcaseTabs, tractorShowcaseLabels, tractorShowcaseLinks, type TractorShowcaseTab } from '@/lib/tractor-showcase';
import '@/app/tractor-showcase.css';

export function ShowcaseTractorCard({ tractor, design = 'default' }: { tractor: Tractor; design?: 'default' | 'reference' }) {
  const [failedImage, setFailedImage] = useState('');
  const href = '/tractor/' + encodeURIComponent(tractor.brandSlug) + '/' + encodeURIComponent(tractor.slug);
  return <article className="showcase-tractor-card">
    <LocalizedElement as="a" href={href} className="showcase-tractor-photo" aria-label={'View ' + tractor.name}>
      {tractor.image && tractor.image !== failedImage ? <LocalizedElement as="img" src={tractor.image} alt={tractor.name} loading="lazy" width={480} height={280} onError={() => setFailedImage(tractor.image || '')}/> : <LocalizedElement as="span">Image not added</LocalizedElement>}
    </LocalizedElement>
    {tractor.inDemand === true && <LocalizedElement as="span" className="showcase-demand"><LocalizedElement as="img" src="/icons/tabler/flame.svg" alt="" width={13} height={13}/> In demand</LocalizedElement>}
    <LocalizedElement as="div" className="showcase-tractor-body"><LocalizedElement as="h3"><LocalizedElement as="a" href={href}>{tractor.name}</LocalizedElement></LocalizedElement>
      <LocalizedElement as="div" className="showcase-specs"><LocalizedElement as="span"><LocalizedElement as="img" src="/icons/tabler/engine.svg" alt="" width={16} height={16}/>{tractor.hp > 0 ? tractor.hp + ' HP' : 'HP not listed'}</LocalizedElement><LocalizedElement as="span"><LocalizedElement as="img" src="/icons/tabler/settings.svg" alt="" width={16} height={16}/>{Number(tractor.engineCapacityCc) > 0 ? tractor.engineCapacityCc + ' CC' : 'CC not listed'}</LocalizedElement></LocalizedElement>
      {design === 'reference' ? <LocalizedElement as="a" className="showcase-detail" href={href}>View specifications<LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement> : <LocalizedElement as="a" className="showcase-price" href={href + '#price'} aria-label={'Check tractor price for ' + tractor.name}>Check Tractor Price</LocalizedElement>}
    </LocalizedElement>
  </article>;
}

function CatalogDiscovery({ tab }: { tab: TractorShowcaseTab }) {
  return <LocalizedElement as="div" className="showcase-discovery">
    <LocalizedElement as="div" className="showcase-discovery-copy">
      <LocalizedElement as="p" className="showcase-availability">No {tractorShowcaseLabels[tab].toLowerCase()} tractors listed yet.</LocalizedElement>
      <LocalizedElement as="h3">The right tractor starts<br />with the work you do.</LocalizedElement>
      <LocalizedElement as="p">Choose a power range to explore the catalog. New models appear as they are published.</LocalizedElement>
      <LocalizedElement as="div" className="showcase-power-links" aria-label="Browse tractors by horsepower">
        <LocalizedElement as="a" href="/tractors?minHp=0&maxHp=29">Under 30 HP <LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement>
        <LocalizedElement as="a" href="/tractors?minHp=30&maxHp=45">30–45 HP <LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement>
        <LocalizedElement as="a" href="/tractors?minHp=45&maxHp=60">45–60 HP <LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement>
        <LocalizedElement as="a" href="/tractors?minHp=61">Over 60 HP <LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement>
      </LocalizedElement>
    </LocalizedElement>
    <figure><LocalizedElement as="img" src="/hero/mahindra-575-di-xp-plus.webp" alt="Mahindra tractor in a field, an illustration for the research guide" loading="lazy" width={600} height={400}/><LocalizedElement as="figcaption"><LocalizedElement as="span">Tractor research, made clearer</LocalizedElement><LocalizedElement as="span">Explore. Compare. Decide.</LocalizedElement></LocalizedElement></figure>
  </LocalizedElement>;
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
  return <section className={"tractor-showcase" + (design === 'reference' ? ' showcase-reference' : '')} aria-labelledby={id + '-heading'}><LocalizedElement as="div" className="tractor-showcase-inner">
    <LocalizedElement as="div" className="showcase-heading"><LocalizedElement as="div"><LocalizedElement as="p">EXPLORE THE CATALOG</LocalizedElement><LocalizedElement as="h2" id={id + '-heading'}>{title}</LocalizedElement></LocalizedElement><LocalizedElement as="a" href="/tractors">All tractors <LocalizedElement as="img" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/></LocalizedElement></LocalizedElement>
    <LocalizedElement as="div" className="showcase-tabs" role="tablist" aria-label="Browse tractors">{tractorShowcaseTabs.map((key, index) => <LocalizedElement as="button" key={key} ref={element => { buttons.current[index] = element; }} id={id + '-' + key} type="button" role="tab" aria-controls={id + '-panel'} aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onKeyDown={event => navigate(event, index)} onClick={() => setTab(key)}>{tractorShowcaseLabels[key]}</LocalizedElement>)}</LocalizedElement>
    <LocalizedElement as="div" id={id + '-panel'} role="tabpanel" aria-labelledby={id + '-' + tab} tabIndex={0} aria-busy={loading}>
      {loading ? <LocalizedElement as="p" className="showcase-message" role="status">Loading tractors…</LocalizedElement> : error ? <LocalizedElement as="div" className="showcase-message" role="alert"><LocalizedElement as="p">Unable to load tractors right now.</LocalizedElement>{onRetry && <LocalizedElement as="button" type="button" onClick={onRetry}>Try again</LocalizedElement>}</LocalizedElement> : items.length ? <LocalizedElement as="div" className="showcase-row" ref={row}>{items.map(tractor => <ShowcaseTractorCard key={tractor.id} tractor={tractor} design={design}/>)}</LocalizedElement> : <CatalogDiscovery tab={tab} />}
    </LocalizedElement>
    {!loading && !error && <LocalizedElement as="div" className="showcase-footer"><LocalizedElement as="a" href={tractorShowcaseLinks[tab]}>View All {tractorShowcaseLabels[tab]} Tractors</LocalizedElement></LocalizedElement>}
  </LocalizedElement></section>;
}
