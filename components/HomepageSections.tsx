'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { FavouriteButton } from './FavouriteButton';
import type { Tractor } from '@/types/content';
import type { Partner } from '@/services/partners';
import type { SiteRecord } from '@/services/site-data';
import '@/app/homepage.css';
import { createPartnerScroller, partnerScrollMetrics } from '@/lib/partner-scroll';

type Brand = { id: string; name: string; slug: string; logo: string };
const Arrow = () => <img className="home-arrow" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/>;
function Heading({ eyebrow, title, description, href, action }: { eyebrow: string; title: string; description?: string; href?: string; action?: string }) {
  return <div className="home-section-heading"><div><p className="home-eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="home-description">{description}</p>}</div>{href && <a className="home-text-link" href={href}>{action}<Arrow /></a>}</div>;
}
function Image({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  return src && src !== failedSource ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailedSource(src)} /> : <span className={'home-image-empty ' + className}>Image not available</span>;
}
function Loop({ children, duplicate, label, duration = 50 }: { children: ReactNode; duplicate: ReactNode; label: string; duration?: number }) {
  const [paused, setPaused] = useState(false);
  return <div className="home-loop-shell"><div className="home-loop-window" tabIndex={0} role="region" aria-label={label}><div className="home-loop-track" style={{ '--loop-duration': duration + 's', animationPlayState: paused ? 'paused' : undefined } as CSSProperties}>
    <div className="home-loop-group">{children}</div><div className="home-loop-group" aria-hidden="true" inert>{duplicate}</div>
  </div></div><button type="button" className="home-loop-toggle" aria-label={(paused ? 'Resume ' : 'Pause ') + label.toLowerCase()} aria-pressed={paused} onClick={() => setPaused(value => !value)}><span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span></button></div>;
}

export function HomeIntroduction({ title }: { title: string }) {
  return <section className="home-v2 home-introduction"><div className="home-container">
    <div className="home-intro-heading"><p className="home-eyebrow">YOUR RESEARCH TOOLKIT</p><h2>{title}</h2></div>
    <div className="home-tool-grid">{[
      ['01', 'Find your tractor', 'Explore models by brand and horsepower.', 'Explore tractors', '/tractors'],
      ['02', 'Compare the details', 'Review the specifications side by side.', 'Compare models', '/compare'],
      ['03', 'Connect with a dealer', 'Find a local showroom for your next step.', 'Find a dealer', '/dealers'],
    ].map(([number, label, copy, action, href]) => <a className="home-tool" href={href} key={number}><span className="home-step">{number}</span><div><h3>{label}</h3><p>{copy}</p><span className="home-tool-action">{action}</span></div><Arrow /></a>)}</div>
  </div></section>;
}

const powerRanges = [['Under 30', '0', '29'], ['30–45', '30', '45'], ['45–60', '45', '60'], ['Over 60', '61', '']];
function PowerRanges() {
  return <div className="home-power-ranges" aria-label="Find tractors by horsepower">{powerRanges.map(([label, min, max]) => <a key={label} href={'/tractors?minHp=' + min + (max ? '&maxHp=' + max : '')}><span><strong>{label}</strong><small>HP</small></span><Arrow /></a>)}</div>;
}
function priceLabel(tractor: Tractor) {
  if (!(tractor.minPrice > 0)) return 'Price not listed';
  const format = (value: number) => value >= 100000 ? '₹' + (value / 100000).toFixed(2) + ' Lakh' : '₹' + value.toLocaleString('en-IN');
  return tractor.maxPrice > tractor.minPrice ? format(tractor.minPrice) + ' – ' + format(tractor.maxPrice) : format(tractor.minPrice);
}
function HomeTractor({ tractor, duplicate = false }: { tractor: Tractor; duplicate?: boolean }) {
  const href = '/tractor/' + encodeURIComponent(tractor.brandSlug) + '/' + encodeURIComponent(tractor.slug);
  return <article className="home-tractor-card"><div className="home-tractor-image"><a href={href} tabIndex={duplicate ? -1 : undefined}><Image src={tractor.image} alt={tractor.name} /></a><span className="home-tractor-tag">{tractor.condition === 'used' ? 'Used tractor' : tractor.brandName}</span>{!duplicate && <FavouriteButton compact itemId={tractor.id} itemType="tractor" title={tractor.name} href={href} image={tractor.image} />}</div>
    <div className="home-tractor-copy"><p>{tractor.hp > 0 ? tractor.hp + ' HP' : 'Tractor specifications'}{tractor.driveType ? ' · ' + tractor.driveType : ''}</p><h3><a href={href}>{tractor.name}</a></h3><div className="home-tractor-price"><strong>{priceLabel(tractor)}</strong>{tractor.minPrice > 0 && <small>Estimated price</small>}</div><div className="home-tractor-actions"><a href={href}>View details <Arrow /></a><a href={'/compare?tractor=' + encodeURIComponent(tractor.id)}>＋ Compare</a></div></div>
  </article>;
}
export function HomeTractors({ title, tractors }: { title: string; tractors: Tractor[] }) {
  const shown = tractors.slice(0, 6);
  return <section className="home-v2 home-catalog"><div className="home-container">
    <Heading eyebrow="THE TRACTOR EDIT" title={title} description="Find the right machine for the work you do." href="/tractors" action="Explore the catalog" />
    {shown.length > 1 ? <Loop label="Tractor models" duration={shown.length * 12} duplicate={shown.map(tractor => <HomeTractor key={tractor.id} tractor={tractor} duplicate />)}>{shown.map(tractor => <HomeTractor key={tractor.id} tractor={tractor} />)}</Loop> : shown.length === 1 ? <div className="home-single-tractor"><HomeTractor tractor={shown[0]} /><div><p className="home-eyebrow">BUILD YOUR SHORTLIST</p><h3>Start with the work.<br />Then explore the details.</h3><p>Use horsepower to narrow your search, then check the full specifications of each model.</p><PowerRanges /></div></div> : <div className="home-catalog-start"><div><p className="home-eyebrow">WHERE SHOULD YOU START?</p><h3>Your land. Your work.<br /><em>Your next tractor.</em></h3><p>Start with a horsepower range, then explore model specifications and compare your options.</p><PowerRanges /><small>New models appear here when they are published.</small></div><figure><Image src="/hero/mahindra-575-di-xp-plus.webp" alt="A red Mahindra 575 DI XP Plus tractor in a field" /><figcaption>THE DETAILS MAKE THE DIFFERENCE <Arrow /></figcaption></figure></div>}
    {shown.length > 1 && <div className="home-catalog-bottom"><span>Have a power range in mind?</span><PowerRanges /></div>}
  </div></section>;
}

export function HomeBrands({ title, brands, tractors }: { title: string; brands: Brand[]; tractors: Tractor[] }) {
  if (!brands.length) return null;
  return <section className="home-v2 home-brands"><div className="home-container home-brand-layout"><Heading eyebrow="KNOW YOUR OPTIONS" title={title} description="Explore the manufacturers, then compare the models and specifications that suit your work." href="/brands" action="All tractor brands" /><div className={'home-brand-cards' + (brands.length === 1 ? ' home-one-brand' : '')}>{brands.slice(0, 12).map(brand => {
    const count = tractors.filter(tractor => tractor.brandId === brand.id || tractor.brandSlug === brand.slug).length;
    return <a key={brand.id} href={'/brand/' + encodeURIComponent(brand.slug)}><div className="home-brand-logo">{brand.logo ? <Image src={brand.logo} alt={brand.name + ' logo'} /> : <strong>{brand.name}</strong>}</div><div><h3>{brand.name}</h3><p>{count ? count + (count === 1 ? ' listed model' : ' listed models') : 'Explore this brand'}</p></div><Arrow /></a>;
  })}</div></div></section>;
}

export function HomeCompare({ title }: { title: string }) {
  const comparisonCards = [
    { title: 'Power & performance', copy: 'Compare horsepower, torque and overall capability.', icon: 'tractor' },
    { title: 'Engine', copy: 'Review engine type, capacity and listed specifications.', icon: 'engine' },
    { title: 'Transmission', copy: 'Compare gear options, drive type and transmission details.', icon: 'settings' },
    { title: 'Features', copy: 'Review the saved features that support your work.', icon: 'book-2' },
  ];
  return <section className="home-v2 home-compare"><div className="home-container"><div className="home-compare-panel">
    <div className="home-compare-copy"><p className="home-eyebrow">COMPARE TRACTORS</p><h2>{title}</h2><p>Review the specifications that matter and find the right fit for your work.</p><a className="home-button" href="/compare">Start comparing <Arrow /></a></div>
    <div className="home-compare-grid" aria-label="Tractor comparison categories">{comparisonCards.map(card => <article className="home-compare-card" key={card.title}>
      <img src={'/icons/tabler/' + card.icon + '.svg'} alt="" width={38} height={38}/><h3>{card.title}</h3><span aria-hidden="true"/><p>{card.copy}</p>
    </article>)}</div>
  </div></div></section>;
}

export function HomeArticles({ title, articles }: { title: string; articles: SiteRecord[] }) {
  return <section className="home-v2 home-editorial"><div className="home-container"><Heading eyebrow="INSIGHTS & RESOURCES" title={title} description="Practical information to support your next decision, in the showroom and in the field." href="/articles" action="Explore all stories" />
    {articles.length ? <div className="home-story-grid" data-count={Math.min(articles.length,3)}>{articles.slice(0, 3).map((item, index) => <a className={index === 0 ? 'home-story home-story-feature' : 'home-story'} href={'/articles/' + encodeURIComponent(String(item.slug))} key={item.id}><div className="home-story-photo"><Image src={String(item.image ?? item.coverImage ?? '')} alt={String(item.title)} /><span className="home-story-type">{String(item.categoryName || item.category || (item.articleType === 'news' ? 'NEWS' : 'FIELD NOTES'))}</span></div><div className="home-story-copy"><h3>{String(item.title)}</h3>{item.excerpt ? <p>{String(item.excerpt)}</p> : null}<span className="home-text-link">Read the story <Arrow /></span></div></a>)}</div> : <div className="home-reading-grid">{[
      ['book-2', 'Buying & research', 'Explore the latest published guides on tractor selection, features and ownership.', '/articles', 'Explore guides'],
      ['tractor', 'Equipment & implements', 'Understand the machinery behind each job and find equipment for your farm.', '/equipment', 'Explore equipment'],
      ['news', 'Industry updates', 'Read the news and farming updates published by RJ Tractor Techs.', '/news', 'Browse news'],
    ].map(([icon, label, copy, href, action], index) => <a href={href} key={icon}><span className="home-reading-number"><img src={'/icons/tabler/' + icon + '.svg'} alt="" width={32} height={32}/></span><span className="home-reading-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="home-reading-accent" aria-hidden="true"/><h3>{label}</h3><p>{copy}</p><span className="home-text-link">{action}<Arrow /></span></a>)}</div>}
  </div></section>;
}

export function HomeVideos({ title, videos, channelUrl }: { title: string; videos: SiteRecord[]; channelUrl?: string }) {
  if (!videos.length && !channelUrl) return null;
  if (!videos.length) return <section className="home-v2 home-videos"><div className="home-container"><Heading eyebrow="WATCH & LEARN" title={title} description="Tractor walkthroughs, practical demonstrations and stories from the field." href="/videos" action="Video library"/>
    <div className="home-video-empty"><div className="home-video-empty-image"><img src="/hero/mahindra-575-di-xp-plus.webp" alt="Red tractor in a field" loading="lazy" width={600} height={400}/></div><div className="home-video-empty-copy"><img className="home-youtube-icon" src="/icons/tabler/brand-youtube.svg" alt="" width={46} height={46}/><h3>A closer look at the machines that matter.</h3><p>No videos have been added to the library yet. Visit our YouTube channel for tractor reviews and field demonstrations.</p><a className="home-button" href={channelUrl} target="_blank" rel="noreferrer">Explore the channel <Arrow/></a></div></div>
  </div></section>;
  return <section className="home-v2 home-videos home-video-library"><div className="home-container"><Heading eyebrow="WATCH & LEARN" title={title} description="Walkthroughs, field tests and practical demonstrations." href="/videos" action="All videos" /><div className="home-video-grid">{videos.slice(0, 9).map(item => <a href={'/videos/' + encodeURIComponent(String(item.slug))} className="home-video-card" key={item.id}><div><Image src={String(item.thumbnail || '')} alt={String(item.title)} /></div><p>{String(item.categoryName || item.category || 'WATCH & LEARN')}</p><h3>{String(item.title)}</h3><span className="home-text-link">Watch video <Arrow /></span></a>)}</div>{channelUrl ? <a className="home-video-channel" href={channelUrl} target="_blank" rel="noreferrer"><img src="/icons/tabler/brand-youtube.svg" alt="" width={22} height={22}/>Watch on YouTube <Arrow /></a> : null}</div></section>;
}

function PartnerLogoCarousel({ partners }: { partners: Partner[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const windowElement = viewport.current;
    const trackElement = track.current;
    const groupElement = firstGroup.current;
    if (!windowElement || !trackElement || !groupElement) return;
    const controller = createPartnerScroller({
      render: offset => { trackElement.style.transform = 'translate3d(' + offset.toFixed(3) + 'px,0,0)'; },
      requestFrame: callback => window.requestAnimationFrame(callback),
      cancelFrame: id => window.cancelAnimationFrame(id),
    });
    const measure = () => {
      const next = partnerScrollMetrics(windowElement.clientWidth, groupElement.getBoundingClientRect().width);
      setCopies(previous => previous === next.copies ? previous : next.copies);
      controller.setLoopWidth(next.loopWidth);
    };
    measure();
    controller.play();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(windowElement);
    observer?.observe(groupElement);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      controller.destroy();
    };
  }, [partners.length]);

  return <div className="home-loop-shell">
    <div ref={viewport} className="home-loop-window home-partner-window" role="region" aria-label="Partner logos">
      <div ref={track} className="home-partner-track">
        {Array.from({ length: copies }, (_, copy) => <div className="home-partner-group" key={copy} ref={copy === 0 ? firstGroup : undefined} aria-hidden={copy > 0 ? true : undefined} inert={copy > 0 ? true : undefined}>
          {partners.map(partner => <div className="home-partner-logo" key={partner.id}><Image src={partner.image} alt={copy === 0 ? partner.title : ''} /></div>)}
        </div>)}
      </div>
    </div>
  </div>;
}

export function HomePartners({ title, partners }: { title: string; partners: Partner[] }) {
  if (!partners.length) return null;
  return <section className="home-v2 home-partners" aria-label={title}><PartnerLogoCarousel partners={partners} /></section>;
}
