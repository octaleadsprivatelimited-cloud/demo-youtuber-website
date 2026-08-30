'use client';
import { useState } from 'react';
import type { SearchItem } from '@/utils/site-search';

function ResultImage({ item }: { item: SearchItem }) {
  const [failed, setFailed] = useState(false);
  return <span className="site-search-thumbnail">{item.image && !failed
    ? <img src={item.image} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <span aria-hidden="true" className="site-search-glass" />}</span>;
}
export function SearchResults({ items, onNavigate }: { items: SearchItem[]; onNavigate?: () => void }) {
  return <ul className="site-search-list">{items.map(item => <li key={item.id}><a href={item.href} onClick={onNavigate}>
    <ResultImage key={item.image} item={item} /><span className="site-search-result-copy"><small>{item.category}</small><strong>{item.title}</strong>{item.description && <span>{item.description}</span>}</span><span className="site-search-arrow" aria-hidden="true">↗</span>
  </a></li>)}</ul>;
}
export function SearchBrowse({ onNavigate }: { onNavigate?: () => void }) {
  return <div className="site-search-browse"><p>Browse by section</p><div>{[['Tractors','/tractors'],['Brands','/brands'],['Articles','/articles'],['Equipment','/equipment'],['Videos','/videos'],['Dealers','/dealers']].map(([title, href]) => <a key={href} href={href} onClick={onNavigate}>{title}<span aria-hidden="true">↗</span></a>)}</div></div>;
}
export function SearchWarning({ unavailable, retry }: { unavailable: string[]; retry: () => void }) {
  return unavailable.length ? <div className="site-search-warning" role="status">Some content could not be searched ({unavailable.join(', ')}).<button type="button" onClick={retry}>Try again</button></div> : null;
}
