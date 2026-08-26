'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listEquipment,type Equipment } from '@/services/media';

export default function EquipmentCategoryClient({categorySlug}:{categorySlug:string}){const [items,setItems]=useState<Equipment[]>([]);const [loading,setLoading]=useState(isFirebaseConfigured);useEffect(()=>{if(!isFirebaseConfigured)return;listEquipment(categorySlug).then(setItems).finally(()=>setLoading(false));},[categorySlug]);const title=categorySlug.replaceAll('-',' ');return <PublicShell><main><section className="page-hero"><p>FARM EQUIPMENT CATEGORY</p><h1>{title}</h1><span>Published agricultural equipment, specifications and price information.</span></section>{!isFirebaseConfigured?<SetupNotice/>:<section className="equipment-list">{loading?<div className="detail-loading">Loading equipment…</div>:!items.length?<div className="empty-state"><h3>No published equipment in this category.</h3><a href="/equipment">Browse all equipment →</a></div>:<div className="equipment-grid">{items.map(item=><article key={item.id}><div style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><section><p>{item.brandName??item.categoryName}</p><h2>{item.name}</h2><span>{item.description}</span><a href={'/equipment/'+item.categorySlug+'/'+item.slug}>View equipment →</a></section></article>)}</div>}</section>}</main></PublicShell>;}

