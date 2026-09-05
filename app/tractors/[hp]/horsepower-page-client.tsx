'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


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
  return <PublicShell><main className="hp-page"><section className="page-hero"><LocalizedElement as="p">TRACTORS BY POWER</LocalizedElement><LocalizedElement as="h1">{range.min}–{range.max} HP tractors</LocalizedElement><LocalizedElement as="span">Compare published models in this horsepower range, including estimated prices and core specifications.</LocalizedElement></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="hp-content">{loading?<LocalizedElement as="div" className="detail-loading">Loading tractors…</LocalizedElement>:!items.length?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">No published tractors in this HP range.</LocalizedElement><LocalizedElement as="a" href="/tractors">Browse all tractors →</LocalizedElement></LocalizedElement>:<LocalizedElement as="div" className="tractor-grid">{items.map(item=><TractorCard tractor={item} key={item.id}/>)}</LocalizedElement>}<nav className="hp-links">{[[20,30],[30,40],[40,50],[50,60],[60,70],[70,90]].map(([min,max])=><LocalizedElement as="a" key={min} href={'/tractors/'+min+'-'+max+'-hp'}>{min}–{max} HP</LocalizedElement>)}</nav></section>}</main></PublicShell>;
}

