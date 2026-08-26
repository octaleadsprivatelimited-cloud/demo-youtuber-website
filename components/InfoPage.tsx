'use client';
import {useEffect,useState} from 'react';
import {PublicShell} from './SiteChrome';
import {getPublishedSetting} from '@/services/public-content';
export function InfoPage({settingKey,eyebrow,title,intro,children}:{settingKey:string;eyebrow:string;title:string;intro:string;children:React.ReactNode}){const [content,setContent]=useState<string|null>(null);useEffect(()=>{getPublishedSetting(settingKey).then(item=>setContent(item?String(item.value??''):null)).catch(()=>setContent(null));},[settingKey]);return <PublicShell><main className="info-page"><section className="page-hero"><p>{eyebrow}</p><h1>{title}</h1><span>{intro}</span></section><article className="info-content">{content?<div className="cms-copy">{content.split('\n').map((line,index)=><p key={index}>{line}</p>)}</div>:children}</article></main></PublicShell>}
