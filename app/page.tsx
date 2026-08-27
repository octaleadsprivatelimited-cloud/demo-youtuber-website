'use client';
import { useEffect,useState,type FormEvent } from 'react';
import { HeroSlideImage } from '@/components/HeroSlideImage';
import { HomepagePromotions } from '@/components/HomepagePromotions';
import { SiteHeader,SiteFooter,useSiteSettings } from '@/components/SiteChrome';
import { TractorCard } from '@/components/TractorCard';
import { normalizeTractor } from '@/services/tractors';
import { subscribeHeroSlides,type HeroSlide } from '@/services/hero-slides';
import { subscribePartners,type Partner } from '@/services/partners';
import { usePublicRecords } from '@/hooks/usePublicRecords';
import { resolveHomepageSections } from '@/config/homepage-sections';

export default function Home(){
  const [heroSlides,setHeroSlides]=useState<HeroSlide[]>([]);
  const [heroIndex,setHeroIndex]=useState(0);
  const [partners,setPartners]=useState<Partner[]>([]);
  const [finderTab,setFinderTab]=useState<'new'|'used'>('new');
  const [finderBrand,setFinderBrand]=useState('');
  const [finderHp,setFinderHp]=useState('');
  const {items:tractorRecords}=usePublicRecords('tractors');
  const {items:brandRecords}=usePublicRecords('brands');
  const {items:articles}=usePublicRecords('articles');
  const {items:videos}=usePublicRecords('videos');
  const {items:sectionRecords}=usePublicRecords('homepageSections');
  const settings=useSiteSettings();
  const tractors=tractorRecords.map(normalizeTractor);
  const brands=brandRecords.map(row=>({...row,name:String(row.name??row.title??''),slug:String(row.slug),logo:String(row.logo??'')}));
  useEffect(()=>subscribeHeroSlides(slides=>{setHeroSlides(slides);setHeroIndex(0);}),[]);
  useEffect(()=>subscribePartners(setPartners),[]);
  useEffect(()=>{if(heroSlides.length<2)return;const timer=window.setInterval(()=>setHeroIndex(index=>(index+1)%heroSlides.length),3000);return()=>window.clearInterval(timer);},[heroSlides.length]);
  function submitFinder(event:FormEvent){
    event.preventDefault();
    const params=new URLSearchParams();
    if(finderBrand)params.set('brand',finderBrand);
    params.set('condition',finderTab);
    const ranges:Record<string,[number,number?]>={'Below 30 HP':[0,29],'30–45 HP':[30,45],'45–60 HP':[45,60],'Above 60 HP':[61]};
    if(ranges[finderHp]){params.set('minHp',String(ranges[finderHp][0]));if(ranges[finderHp][1])params.set('maxHp',String(ranges[finderHp][1]));}
    window.location.href='/tractors?'+params.toString();
  }
  function renderSection(key:string,title:string){
    if(key==='hero')return <section className="reference-hero" aria-label="Find your right tractor">{(()=>{const slide=heroSlides[heroIndex];return <><HeroSlideImage slide={slide}/>{heroSlides.length>1&&<div className="reference-slide-dots" aria-label="Hero slides">{heroSlides.map((item,index)=><button type="button" key={item.id} className={index===heroIndex?'active':''} onClick={()=>setHeroIndex(index)} aria-label={`Show slide ${Number(item.order)||index+1}`}/>)}</div>}<form className="reference-finder" onSubmit={submitFinder}><h1>{title}</h1><div className="reference-tabs"><button type="button" className={finderTab==='new'?'active':''} onClick={()=>setFinderTab('new')}>New Tractor</button><button type="button" className={finderTab==='used'?'active':''} onClick={ ()=>setFinderTab('used')}>Used Tractor</button></div><label><span className="sr-only">Select Brand</span><select value={finderBrand} onChange={event=>setFinderBrand(event.target.value)}><option value="">Select Brand</option>{brands.map(brand=><option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label><label><span className="sr-only">Select HP</span><select value={finderHp} onChange={event=>setFinderHp(event.target.value)}><option value="">Select HP</option><option>Below 30 HP</option><option>30–45 HP</option><option>45–60 HP</option><option>Above 60 HP</option></select></label><button className="reference-finder-submit" type="submit">Search</button><a href="/tractors">Find All Tractors</a></form><button hidden={heroSlides.length<2} className="reference-arrow reference-arrow-left" type="button" onClick={()=>setHeroIndex(index=>heroSlides.length?(index-1+heroSlides.length)%heroSlides.length:0)} aria-label="Previous banner">‹</button><button hidden={heroSlides.length<2} className="reference-arrow reference-arrow-right" type="button" onClick={()=>setHeroIndex(index=>heroSlides.length?(index+1)%heroSlides.length:0)} aria-label="Next banner">›</button></>})()}</section>;
    if(key==='promotions')return <HomepagePromotions title={title}/>;
    if(key==='introduction')return <section className="intro-strip" aria-label={title}><div><span>01</span><p><strong>Find your tractor</strong>Search by brand, power or budget.</p></div><div><span>02</span><p><strong>Compare the details</strong>See important specifications side by side.</p></div><div><span>03</span><p><strong>Make an informed choice</strong>Watch reviews and estimate ownership costs.</p></div></section>;
    if(key==='tractors'&&tractors.length)return <section className="content-section"><div className="section-head"><div><p>TRACTOR RESEARCH</p><h2>{title}</h2></div><a href="/tractors">Explore all tractors →</a></div><div className="tractor-marquee"><div className="tractor-marquee-track" style={tractors.length<2?{animation:'none'}:undefined}>{(tractors.length>1?[...tractors.slice(0,6),...tractors.slice(0,6)]:tractors).map((tractor,index)=><TractorCard tractor={tractor} duplicate={index>=Math.min(tractors.length,6)} key={tractor.id+'-'+index}/>)}</div></div></section>;
    if(key==='brands'&&brands.length)return <section className="brand-section"><div className="section-head"><div><p>EXPLORE THE MARKET</p><h2>{title}</h2></div><a href="/brands">View every brand →</a></div><div className="brand-grid">{brands.slice(0,6).map(brand=><a href={'/brand/'+brand.slug} key={brand.id}><span className="brand-logo-tile">{brand.logo?<img src={brand.logo} alt={brand.name+' logo'}/>:brand.name}</span><strong>{brand.name}</strong><small>{tractors.filter(tractor=>tractor.brandId===brand.id||tractor.brandSlug===brand.slug).length} models →</small></a>)}</div></section>;
    if(key==='compare')return <section className="compare-banner"><div><p>SMARTER DECISIONS</p><h2>{title}</h2><span>Evaluate power, transmission, hydraulics, dimensions, features and price in one clear view.</span></div><div className="compare-cards"><div><small>TRACTOR 01</small><strong>Choose a tractor</strong><a href="/compare" aria-label="Choose first tractor">＋</a></div><b>VS</b><div><small>TRACTOR 02</small><strong>Choose a tractor</strong><a href="/compare" aria-label="Choose second tractor">＋</a></div></div><a href="/compare">Start comparing →</a></section>;
    if(key==='articles'&&articles.length)return <section className="content-section editorial-section"><div className="section-head"><div><p>KNOWLEDGE FOR THE FIELD</p><h2>{title}</h2></div><a href="/articles">Read all stories →</a></div><div className="editorial-grid">{articles.slice(0,3).map((item,index)=><article className={index===0?'feature-story':''} key={item.id}><div className="story-image" style={{backgroundImage:item.image||item.coverImage?'url('+JSON.stringify(String(item.image||item.coverImage))+')':'none'}}/><div><p>{String(item.categoryName||item.category||'ARTICLE')}</p><h3>{String(item.title)}</h3><a href={'/articles/'+item.slug}>Read article →</a></div></article>)}</div></section>;
    if(key==='videos'&&videos.length)return <section className="content-section"><div className="section-head"><div><p>WATCH & LEARN</p><h2>{title}</h2></div><a href="/videos">View all videos →</a></div><div className="editorial-grid">{videos.slice(0,3).map(item=><article key={item.id}><div className="story-image" style={{backgroundImage:item.thumbnail?'url('+JSON.stringify(String(item.thumbnail))+')':'none'}}/><div><h3>{String(item.title)}</h3><a href={'/videos/'+item.slug}>Watch video →</a></div></article>)}</div></section>;
    if(key==='youtube')return <section className="youtube-band"><div className="youtube-icon">▶</div><div><p>WATCH. LEARN. DECIDE.</p><h2>{title}</h2><span>Video reviews, field demonstrations and tractor explainers from the official RJ Tractor Techs channel.</span></div><a href={settings.youtube||'https://www.youtube.com/@Rjtractortechs'} target="_blank" rel="noreferrer">Visit the channel ↗</a></section>;
    if(key==='partners'&&partners.length)return <section className="brand-marquee" aria-label={title}><div className="brand-marquee-window"><div className="brand-marquee-track">{[...partners,...partners].map((partner,index)=><div className="brand-marquee-card" key={partner.id+'-'+index} aria-hidden={index>=partners.length?true:undefined}><span><img src={partner.image} alt={partner.title}/></span></div>)}</div></div></section>;
    return null;
  }
  return <><SiteHeader/><main>{resolveHomepageSections(sectionRecords).map(section=><HomeSection key={section.key}>{renderSection(section.key,section.title)}</HomeSection>)}</main><SiteFooter/></>;
}
function HomeSection({children}:{children:React.ReactNode}){return children;}
