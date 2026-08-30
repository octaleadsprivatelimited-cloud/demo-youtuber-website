'use client';

import { useEffect,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { SetupNotice } from '@/components/SetupNotice';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { listFavourites,toggleFavourite,type FavouriteRecord } from '@/services/phase-three';

export default function FavouritesPage(){
  const {user,loading:authLoading}=useAuth(); const [items,setItems]=useState<FavouriteRecord[]>([]); const [loading,setLoading]=useState(false);
  useEffect(()=>{if(!user||!isFirebaseConfigured)return;setLoading(true);listFavourites(user.uid).then(setItems).finally(()=>setLoading(false));},[user]);
  async function remove(item:FavouriteRecord){if(!user)return;await toggleFavourite({userId:user.uid,itemId:item.itemId,itemType:item.itemType,title:item.title,href:item.href,image:item.image});setItems(current=>current.filter(record=>record.id!==item.id));}
  return <PublicShell><main className="favourites-page"><section className="page-hero"><p>YOUR SAVED RESEARCH</p><h1>Favourites</h1><span>Your saved tractors, articles and videos, ready when you want to pick up your research.</span></section>{!isFirebaseConfigured?<SetupNotice/>:authLoading||loading?<div className="detail-loading">Loading favourites…</div>:!user?<div className="empty-state"><h3>Sign in to view favourites.</h3><a href="/login">Sign in →</a></div>:!items.length?<div className="empty-state"><h3>You haven&apos;t saved anything yet.</h3><a href="/tractors">Explore tractors →</a></div>:<section className="favourite-grid">{items.map(item=><article key={item.id}><div style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><section><p>{item.itemType.toUpperCase()}</p><h2>{item.title}</h2><a href={item.href}>Open →</a><button onClick={()=>remove(item)}>Remove</button></section></article>)}</section>}</main></PublicShell>;
}

