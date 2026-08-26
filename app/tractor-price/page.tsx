'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { TractorCard } from '@/components/TractorCard';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listTractors } from '@/services/tractors';
import type { Tractor } from '@/types/content';

const ranges:[string,number][]=[['Under ₹5 Lakh',500000],['₹5–7 Lakh',700000],['₹7–10 Lakh',1000000],['₹10–15 Lakh',1500000],['Above ₹15 Lakh',3000000]];
export default function TractorPricePage(){
  const [maxPrice,setMaxPrice]=useState<number>();const [items,setItems]=useState<Tractor[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);
  useEffect(()=>{if(!isFirebaseConfigured)return;setLoading(true);listTractors({maxPrice,pageSize:18}).then(page=>setItems(page.items)).finally(()=>setLoading(false));},[maxPrice]);
  return <PublicShell><main className="price-page"><section className="page-hero"><p>TRACTOR PRICE RESEARCH</p><h1>Latest tractor prices</h1><span>Explore published estimated price ranges. Final dealer pricing can vary by location, variant and applicable charges.</span></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="price-content"><div className="price-filters"><button className={!maxPrice?'active':''} onClick={()=>setMaxPrice(undefined)}>All prices</button>{ranges.map(([label,value])=><button className={maxPrice===value?'active':''} key={label} onClick={()=>setMaxPrice(value)}>{label}</button>)}</div>{loading?<div className="detail-loading">Loading prices…</div>:!items.length?<div className="empty-state"><h3>No tractors found in this price range.</h3><button onClick={()=>setMaxPrice(undefined)}>Clear price filter</button></div>:<div className="tractor-grid">{items.map(item=><TractorCard tractor={item} key={item.id}/>)}</div>}</section>}</main></PublicShell>;
}

