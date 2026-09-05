'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useState } from 'react';
import type { SearchItem } from '@/utils/site-search';

function ResultImage({ item }: { item: SearchItem }) {
  const [failed, setFailed] = useState(false);
  return <LocalizedElement as="span" className="site-search-thumbnail">{item.image && !failed
    ? <LocalizedElement as="img" src={item.image} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <LocalizedElement as="span" aria-hidden="true" className="site-search-glass" />}</LocalizedElement>;
}
export function SearchResults({ items, onNavigate }: { items: SearchItem[]; onNavigate?: () => void }) {
  return <ul className="site-search-list">{items.map(item => <LocalizedElement as="li" key={item.id}><LocalizedElement as="a" href={item.href} onClick={onNavigate}>
    <ResultImage key={item.image} item={item} /><LocalizedElement as="span" className="site-search-result-copy"><LocalizedElement as="small">{item.category}</LocalizedElement><LocalizedElement as="strong">{item.title}</LocalizedElement>{item.description && <LocalizedElement as="span">{item.description}</LocalizedElement>}</LocalizedElement><LocalizedElement as="span" className="site-search-arrow" aria-hidden="true">↗</LocalizedElement>
  </LocalizedElement></LocalizedElement>)}</ul>;
}
export function SearchBrowse({ onNavigate }: { onNavigate?: () => void }) {
  return <LocalizedElement as="div" className="site-search-browse"><LocalizedElement as="p">Browse by section</LocalizedElement><LocalizedElement as="div">{[['Tractors','/tractors'],['Brands','/brands'],['Articles','/articles'],['Equipment','/equipment'],['Videos','/videos'],['Dealers','/dealers']].map(([title, href]) => <LocalizedElement as="a" key={href} href={href} onClick={onNavigate}>{title}<LocalizedElement as="span" aria-hidden="true">↗</LocalizedElement></LocalizedElement>)}</LocalizedElement></LocalizedElement>;
}
export function SearchWarning({ unavailable, retry }: { unavailable: string[]; retry: () => void }) {
  return unavailable.length ? <LocalizedElement as="div" className="site-search-warning" role="status">Some content could not be searched ({unavailable.join(', ')}).<LocalizedElement as="button" type="button" onClick={retry}>Try again</LocalizedElement></LocalizedElement> : null;
}
