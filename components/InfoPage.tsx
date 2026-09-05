'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import {PublicShell,useSiteSettings} from './SiteChrome';
import {PageIntro,ReadingContent} from './PublicPageParts';
const links=[['privacy-policy','Privacy policy'],['terms-and-conditions','Terms and conditions'],['disclaimer','Disclaimer'],['cookie-policy','Cookie policy']];
export function InfoPage({settingKey,eyebrow,title,intro,children}:{settingKey:string;eyebrow:string;title:string;intro:string;children:React.ReactNode}){const content=useSiteSettings()[settingKey];return <PublicShell><main className="info-page"><PageIntro eyebrow={eyebrow} title={title} description={intro}/><LocalizedElement as="div" className="info-layout"><article className="info-content">{content?<ReadingContent text={content}/>:children}</article><aside className="info-nav"><LocalizedElement as="h2">Website information</LocalizedElement>{links.map(([key,label])=><LocalizedElement as="a" key={key} href={'/'+key} aria-current={settingKey===key?'page':undefined}>{label}</LocalizedElement>)}<LocalizedElement as="a" href="/contact">Contact us →</LocalizedElement></aside></LocalizedElement></main></PublicShell>;}
