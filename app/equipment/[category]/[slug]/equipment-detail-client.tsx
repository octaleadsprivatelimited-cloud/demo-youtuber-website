'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getEquipment,type Equipment } from '@/services/media';

export default function EquipmentDetailClient({categorySlug,slug}:{categorySlug:string;slug:string}){const [item,setItem]=useState<Equipment|null>(null);const [loading,setLoading]=useState(isFirebaseConfigured);useEffect(()=>{if(!isFirebaseConfigured)return;getEquipment(categorySlug,slug).then(setItem).finally(()=>setLoading(false));},[categorySlug,slug]);return <PublicShell><main className="equipment-detail">{!isFirebaseConfigured?<SetupNotice/>:loading?<LocalizedElement as="div" className="detail-loading">Loading equipment…</LocalizedElement>:!item?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Equipment not found.</LocalizedElement><LocalizedElement as="a" href="/equipment">Browse equipment →</LocalizedElement></LocalizedElement>:<><section className="equipment-detail-hero"><LocalizedElement as="div" style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><article><LocalizedElement as="p">{item.categoryName}{item.brandName?' · '+item.brandName:''}</LocalizedElement><LocalizedElement as="h1">{item.name}</LocalizedElement><LocalizedElement as="span">{item.description}</LocalizedElement>{item.price&&<LocalizedElement as="strong">Estimated from ₹{item.price.toLocaleString('en-IN')}</LocalizedElement>}<LocalizedElement as="a" href="/contact">Ask about this equipment →</LocalizedElement></article></section><section className="equipment-specs"><LocalizedElement as="h2">Specifications</LocalizedElement><table><tbody>{Object.entries(item.specifications??{}).map(([label,value])=><tr key={label}><LocalizedElement as="th">{label}</LocalizedElement><LocalizedElement as="td">{String(value)}</LocalizedElement></tr>)}</tbody></table></section></>}</main></PublicShell>;}

