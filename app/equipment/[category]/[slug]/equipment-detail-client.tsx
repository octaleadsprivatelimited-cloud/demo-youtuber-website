'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getEquipment,type Equipment } from '@/services/media';

export default function EquipmentDetailClient({categorySlug,slug}:{categorySlug:string;slug:string}){const [item,setItem]=useState<Equipment|null>(null);const [loading,setLoading]=useState(isFirebaseConfigured);useEffect(()=>{if(!isFirebaseConfigured)return;getEquipment(categorySlug,slug).then(setItem).finally(()=>setLoading(false));},[categorySlug,slug]);return <PublicShell><main className="equipment-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<div className="detail-loading">Loading equipment…</div>:!item?<div className="empty-state"><h3>Equipment not found.</h3><a href="/equipment">Browse equipment →</a></div>:<><section className="equipment-detail-hero"><div style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><article><p>{item.categoryName}{item.brandName?' · '+item.brandName:''}</p><h1>{item.name}</h1><span>{item.description}</span>{item.price&&<strong>Estimated from ₹{item.price.toLocaleString('en-IN')}</strong>}<a href="/contact">Ask about this equipment →</a></article></section><section className="equipment-specs"><h2>Specifications</h2><table><tbody>{Object.entries(item.specifications??{}).map(([label,value])=><tr key={label}><th>{label}</th><td>{String(value)}</td></tr>)}</tbody></table></section></>}</main></PublicShell>;}

