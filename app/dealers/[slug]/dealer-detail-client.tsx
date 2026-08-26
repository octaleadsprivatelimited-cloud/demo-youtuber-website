'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getDealer,type Dealer } from '@/services/media';

export default function DealerDetailClient({slug}:{slug:string}){const [dealer,setDealer]=useState<Dealer|null>(null);const [loading,setLoading]=useState(isFirebaseConfigured);useEffect(()=>{if(!isFirebaseConfigured)return;getDealer(slug).then(setDealer).finally(()=>setLoading(false));},[slug]);return <PublicShell><main className="dealer-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading dealer…</div>:!dealer?<div className="empty-state"><h3>Dealer not found.</h3><a href="/dealers">Browse dealers →</a></div>:<><section className="dealer-profile"><div className="dealer-logo">{dealer.logo?<img src={dealer.logo} alt={dealer.name+' logo'}/>:dealer.name.slice(0,2).toUpperCase()}</div><article><p>{dealer.verified?'✓ VERIFIED DEALER':'DEALER PROFILE'}</p><h1>{dealer.name}</h1><span>{dealer.address}, {dealer.city}, {dealer.district}, {dealer.state} {dealer.pincode}</span><small>{dealer.brand??'Published tractor dealer'}</small></article></section><section className="dealer-contact"><div><h2>Contact dealer</h2>{dealer.phone&&<a href={'tel:'+dealer.phone}>Call {dealer.phone}</a>}{dealer.whatsapp&&<a href={'https://wa.me/'+dealer.whatsapp.replace(/\D/g,'')} target="_blank" rel="noreferrer">WhatsApp dealer ↗</a>}{dealer.email&&<a href={'mailto:'+dealer.email}>Email dealer</a>}</div><div><h2>Services</h2>{dealer.services?.map(service=><span key={service}>{service}</span>)}</div><div><h2>Location</h2>{dealer.latitude&&dealer.longitude?<a href={'https://maps.google.com/?q='+dealer.latitude+','+dealer.longitude} target="_blank" rel="noreferrer">Open in Maps ↗</a>:<span>Map coordinates not published.</span>}</div></section></>}</main></PublicShell>;}

