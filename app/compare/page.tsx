'use client';

import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getTractorsByIds } from '@/services/phase-three';
import { listTractors } from '@/services/tractors';
import type { Tractor } from '@/types/content';

const rows: Array<[string, (tractor: Tractor) => string]> = [
  ['Power', tractor => tractor.hp + ' HP'],
  ['Engine', tractor => tractor.engineCapacityCc ? tractor.engineCapacityCc + ' cc' : '—'],
  ['Cylinders', tractor => tractor.cylinders ? String(tractor.cylinders) : '—'],
  ['Transmission', tractor => tractor.transmission],
  ['Drive type', tractor => tractor.driveType ?? '—'],
  ['PTO power', tractor => tractor.ptoHp ? tractor.ptoHp + ' HP' : '—'],
  ['Lifting capacity', tractor => tractor.liftingCapacityKg ? tractor.liftingCapacityKg + ' kg' : '—'],
  ['Estimated price', tractor => '₹' + (tractor.minPrice/100000).toFixed(2) + '–' + (tractor.maxPrice/100000).toFixed(2) + ' Lakh'],
];

export default function ComparePage() {
  const [catalog,setCatalog] = useState<Tractor[]>([]);
  const [selectedIds,setSelectedIds] = useState<string[]>([]);
  const [tractors,setTractors] = useState<Tractor[]>([]);
  const [loading,setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    listTractors({pageSize:24}).then(page => setCatalog(page.items)).catch(() => undefined);
    const initial = new URLSearchParams(window.location.search).getAll('tractor').slice(0,3);
    if (initial.length) setSelectedIds(initial); else setLoading(false);
  }, []);
  useEffect(() => {
    if (!selectedIds.length) { setTractors([]); setLoading(false); return; }
    setLoading(true); getTractorsByIds(selectedIds).then(setTractors).finally(() => setLoading(false));
  }, [selectedIds]);

  function choose(index:number,value:string) {
    setSelectedIds(current => { const next=[...current]; if(value) next[index]=value; else next.splice(index,1); return next.filter(Boolean).slice(0,3); });
  }

  return <PublicShell><main className="compare-page"><section className="page-hero"><p>SIDE-BY-SIDE RESEARCH</p><h1>Compare tractors</h1><span>Select up to three published tractors and evaluate the specifications that matter.</span></section>{!isFirebaseConfigured ? <SetupNotice /> : <section className="compare-workspace">
    <div className="compare-selectors">{[0,1,2].map(index => <div key={index}><span>TRACTOR {String(index+1).padStart(2,'0')}</span><select value={selectedIds[index] ?? ''} onChange={event => choose(index,event.target.value)}><option value="">Choose a tractor</option>{catalog.filter(item => !selectedIds.includes(item.id) || item.id===selectedIds[index]).map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>)}</div>
    {loading ? <div className="detail-loading">Preparing comparison…</div> : tractors.length < 2 ? <div className="empty-state"><h3>Select at least two tractors.</h3><p>Use the selectors above to build a detailed comparison.</p></div> : <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th>Specification</th>{tractors.map(tractor => <th key={tractor.id}>{tractor.name}<small>{tractor.brandName}</small></th>)}</tr></thead><tbody>{rows.map(([label,read]) => <tr key={label}><th>{label}</th>{tractors.map(tractor => <td key={tractor.id}>{read(tractor)}</td>)}</tr>)}</tbody></table><div className="compare-links">{tractors.map(tractor => <a href={'/tractor/'+tractor.brandSlug+'/'+tractor.slug} key={tractor.id}>View {tractor.model} →</a>)}</div></div>}
  </section>}</main></PublicShell>;
}

