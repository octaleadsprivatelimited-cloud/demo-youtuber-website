'use client';
import {PublicShell,useSiteSettings} from './SiteChrome';
import {PageIntro,ReadingContent} from './PublicPageParts';
const links=[['privacy-policy','Privacy policy'],['terms-and-conditions','Terms and conditions'],['disclaimer','Disclaimer'],['cookie-policy','Cookie policy']];
export function InfoPage({settingKey,eyebrow,title,intro,children}:{settingKey:string;eyebrow:string;title:string;intro:string;children:React.ReactNode}){const content=useSiteSettings()[settingKey];return <PublicShell><main className="info-page"><PageIntro eyebrow={eyebrow} title={title} description={intro}/><div className="info-layout"><article className="info-content">{content?<ReadingContent text={content}/>:children}</article><aside className="info-nav"><h2>Website information</h2>{links.map(([key,label])=><a key={key} href={'/'+key} aria-current={settingKey===key?'page':undefined}>{label}</a>)}<a href="/contact">Contact us →</a></aside></div></main></PublicShell>;}
