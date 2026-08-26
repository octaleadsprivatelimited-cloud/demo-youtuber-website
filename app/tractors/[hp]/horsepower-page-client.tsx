'use client';

import { useEffect,useMemo,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { TractorCard } from '@/components/TractorCard';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listTractors } from '@/services/tractors';
import type { Tractor } from '@/types/content';

export default function HorsepowerPageClient({hpSlug}:{hpSlug:string}){
  const range=useMemo(()=>{const match=hpSlug.match(/(\d+)(?:-(\d+))?-hp/);const min=Number(match?.[1]??0);const max=Number(match?.[2]??(min+10));return{min,max};},[hpSlug]);
  const [items,setItems]=useState<Tractor[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);
  useEffect(()=>{if(!isFirebaseConfigured)return;listTractors({minHp:range.min,maxHp:range.max,pageSize:18}).then(page=>setItems(page.items)).finally(()=>setLoading(false));},[range]);
  return <PublicShell><main className="hp-page"><section className="page-hero"><p>TRACTORS BY POWER</p><h1>{range.min}–{range.max} HP tractors</h1><span>Compare published models in this horsepower range, including estimated prices and core specifications.</span></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="hp-content">{loading?<div className="detail-loading">Loading tractors…</div>:!items.length?<div className="empty-state"><h3>No published tractors in this HP range.</h3><a href="/tractors">Browse all tractors →</a></div>:<div className="tractor-grid">{items.map(item=><TractorCard tractor={item} key={item.id}/>)}</div>}<nav className="hp-links">{[[20,30],[30,40],[40,50],[50,60],[60,70],[70,90]].map(([min,max])=><a key={min} href={'/tractors/'+min+'-'+max+'-hp'}>{min}–{max} HP</a>)}</nav></section>}</main></PublicShell>;
}

