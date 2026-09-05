'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


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
  return <PublicShell><main className="favourites-page"><section className="page-hero"><LocalizedElement as="p">YOUR SAVED RESEARCH</LocalizedElement><LocalizedElement as="h1">Favourites</LocalizedElement><LocalizedElement as="span">Your saved tractors, articles and videos, ready when you want to pick up your research.</LocalizedElement></section>{!isFirebaseConfigured?<SetupNotice/>:authLoading||loading?<LocalizedElement as="div" className="detail-loading">Loading favourites…</LocalizedElement>:!user?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">Sign in to view favourites.</LocalizedElement><LocalizedElement as="a" href="/login">Sign in →</LocalizedElement></LocalizedElement>:!items.length?<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h3">You haven&apos;t saved anything yet.</LocalizedElement><LocalizedElement as="a" href="/tractors">Explore tractors →</LocalizedElement></LocalizedElement>:<section className="favourite-grid">{items.map(item=><article key={item.id}><LocalizedElement as="div" style={item.image?{backgroundImage:'url('+item.image+')'}:undefined}/><section><LocalizedElement as="p">{item.itemType.toUpperCase()}</LocalizedElement><LocalizedElement as="h2">{item.title}</LocalizedElement><LocalizedElement as="a" href={item.href}>Open →</LocalizedElement><LocalizedElement as="button" onClick={()=>remove(item)}>Remove</LocalizedElement></section></article>)}</section>}</main></PublicShell>;
}

