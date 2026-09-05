'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listEquipment,type Equipment } from '@/services/media';

export default function EquipmentCategoryClient({categorySlug}:{categorySlug:string}){const [items,setItems]=useState<Equipment[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);useEffect(()=>{if(!isFirebaseConfigured)return;listEquipment(categorySlug).then(setItems).finally(()=>setLoading(false));},[categorySlug]);const title=categorySlug.replaceAll('-',' ');return <PublicShell><main><section className="page-hero"><LocalizedElement as="p">FARM EQUIPMENT CATEGORY</LocalizedElement><LocalizedElement as="h1">{title}</LocalizedElement><LocalizedElement as="span">Published agricultural equipment, specifications and price information.</LocalizedElement></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="equipment-list">{loading?<LocalizedElement as="div" className="detail-loading">Loading equipment…</LocalizedElement>:!items.length?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">No published equipment in this category.</LocalizedElement><LocalizedElement as="a" href="/equipment">Browse all equipment →</LocalizedElement></LocalizedElement>:<LocalizedElement as="div" className="equipment-grid">{items.map(item=><article key={item.id}><LocalizedElement as="div" style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><section><LocalizedElement as="p">{item.brandName??item.categoryName}</LocalizedElement><LocalizedElement as="h2">{item.name}</LocalizedElement><LocalizedElement as="span">{item.description}</LocalizedElement><LocalizedElement as="a" href={'/equipment/'+item.categorySlug+'/'+item.slug}>View equipment →</LocalizedElement></section></article>)}</LocalizedElement>}</section>}</main></PublicShell>;}

