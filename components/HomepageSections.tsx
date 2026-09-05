'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { FavouriteButton } from './FavouriteButton';
import type { Tractor } from '@/types/content';
import type { Partner } from '@/services/partners';
import type { SiteRecord } from '@/services/site-data';
import '@/app/homepage.css';
import { createPartnerScroller, partnerScrollMetrics } from '@/lib/partner-scroll';

type Brand = { id: string; name: string; slug: string; logo: string };
const Arrow = () => <LocalizedElement as="img" className="home-arrow" src="/icons/tabler/chevron-right.svg" alt="" width={18} height={18}/>;
function Heading({ eyebrow, title, description, href, action }: { eyebrow: string; title: string; description?: string; href?: string; action?: string }) {
  return <LocalizedElement as="div" className="home-section-heading"><LocalizedElement as="div"><LocalizedElement as="p" className="home-eyebrow">{eyebrow}</LocalizedElement><LocalizedElement as="h2">{title}</LocalizedElement>{description && <LocalizedElement as="p" className="home-description">{description}</LocalizedElement>}</LocalizedElement>{href && <LocalizedElement as="a" className="home-text-link" href={href}>{action}<Arrow /></LocalizedElement>}</LocalizedElement>;
}
function Image({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>();
  return src && src !== failedSource ? <LocalizedElement as="img" className={className} src={src} alt={alt} loading="lazy" onError={() => setFailedSource(src)} /> : <LocalizedElement as="span" className={'home-image-empty ' + className}>Image not available</LocalizedElement>;
}
function Loop({ children, duplicate, label, duration = 50 }: { children: ReactNode; duplicate: ReactNode; label: string; duration?: number }) {
  const [paused, setPaused] = useState(false);
  return <LocalizedElement as="div" className="home-loop-shell"><LocalizedElement as="div" className="home-loop-window" tabIndex={0} role="region" aria-label={label}><LocalizedElement as="div" className="home-loop-track" style={{ '--loop-duration': duration + 's', animationPlayState: paused ? 'paused' : undefined } as CSSProperties}>
    <LocalizedElement as="div" className="home-loop-group">{children}</LocalizedElement><LocalizedElement as="div" className="home-loop-group" aria-hidden="true" inert>{duplicate}</LocalizedElement>
  </LocalizedElement></LocalizedElement><LocalizedElement as="button" type="button" className="home-loop-toggle" aria-label={(paused ? 'Resume ' : 'Pause ') + label.toLowerCase()} aria-pressed={paused} onClick={() => setPaused(value => !value)}><LocalizedElement as="span" aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</LocalizedElement></LocalizedElement></LocalizedElement>;
}

export function HomeIntroduction({ title }: { title: string }) {
  return <section className="home-v2 home-introduction"><LocalizedElement as="div" className="home-container">
    <LocalizedElement as="div" className="home-intro-heading"><LocalizedElement as="p" className="home-eyebrow">YOUR RESEARCH TOOLKIT</LocalizedElement><LocalizedElement as="h2">{title}</LocalizedElement></LocalizedElement>
    <LocalizedElement as="div" className="home-tool-grid">{[
      ['01', 'Find your tractor', 'Explore models by brand and horsepower.', 'Explore tractors', '/tractors'],
      ['02', 'Compare the details', 'Review the specifications side by side.', 'Compare models', '/compare'],
      ['03', 'Connect with a dealer', 'Find a local showroom for your next step.', 'Find a dealer', '/dealers'],
    ].map(([number, label, copy, action, href]) => <LocalizedElement as="a" className="home-tool" href={href} key={number}><LocalizedElement as="span" className="home-step">{number}</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="h3">{label}</LocalizedElement><LocalizedElement as="p">{copy}</LocalizedElement><LocalizedElement as="span" className="home-tool-action">{action}</LocalizedElement></LocalizedElement><Arrow /></LocalizedElement>)}</LocalizedElement>
  </LocalizedElement></section>;
}

const powerRanges = [['Under 30', '0', '29'], ['30–45', '30', '45'], ['45–60', '45', '60'], ['Over 60', '61', '']];
function PowerRanges() {
  return <LocalizedElement as="div" className="home-power-ranges" aria-label="Find tractors by horsepower">{powerRanges.map(([label, min, max]) => <LocalizedElement as="a" key={label} href={'/tractors?minHp=' + min + (max ? '&maxHp=' + max : '')}><LocalizedElement as="span"><LocalizedElement as="strong">{label}</LocalizedElement><LocalizedElement as="small">HP</LocalizedElement></LocalizedElement><Arrow /></LocalizedElement>)}</LocalizedElement>;
}
function priceLabel(tractor: Tractor) {
  if (!(tractor.minPrice > 0)) return 'Price not listed';
  const format = (value: number) => value >= 100000 ? '₹' + (value / 100000).toFixed(2) + ' Lakh' : '₹' + value.toLocaleString('en-IN');
  return tractor.maxPrice > tractor.minPrice ? format(tractor.minPrice) + ' – ' + format(tractor.maxPrice) : format(tractor.minPrice);
}
function HomeTractor({ tractor, duplicate = false }: { tractor: Tractor; duplicate?: boolean }) {
  const href = '/tractor/' + encodeURIComponent(tractor.brandSlug) + '/' + encodeURIComponent(tractor.slug);
  return <article className="home-tractor-card"><LocalizedElement as="div" className="home-tractor-image"><LocalizedElement as="a" href={href} tabIndex={duplicate ? -1 : undefined}><Image src={tractor.image} alt={tractor.name} /></LocalizedElement><LocalizedElement as="span" className="home-tractor-tag">{tractor.condition === 'used' ? 'Used tractor' : tractor.brandName}</LocalizedElement>{!duplicate && <FavouriteButton compact itemId={tractor.id} itemType="tractor" title={tractor.name} href={href} image={tractor.image} />}</LocalizedElement>
    <LocalizedElement as="div" className="home-tractor-copy"><LocalizedElement as="p">{tractor.hp > 0 ? tractor.hp + ' HP' : 'Tractor specifications'}{tractor.driveType ? ' · ' + tractor.driveType : ''}</LocalizedElement><LocalizedElement as="h3"><LocalizedElement as="a" href={href}>{tractor.name}</LocalizedElement></LocalizedElement><LocalizedElement as="div" className="home-tractor-price"><LocalizedElement as="strong">{priceLabel(tractor)}</LocalizedElement>{tractor.minPrice > 0 && <LocalizedElement as="small">Estimated price</LocalizedElement>}</LocalizedElement><LocalizedElement as="div" className="home-tractor-actions"><LocalizedElement as="a" href={href}>View details <Arrow /></LocalizedElement><LocalizedElement as="a" href={'/compare?tractor=' + encodeURIComponent(tractor.id)}>＋ Compare</LocalizedElement></LocalizedElement></LocalizedElement>
  </article>;
}
export function HomeTractors({ title, tractors }: { title: string; tractors: Tractor[] }) {
  const shown = tractors.slice(0, 6);
  return <section className="home-v2 home-catalog"><LocalizedElement as="div" className="home-container">
    <Heading eyebrow="THE TRACTOR EDIT" title={title} description="Find the right machine for the work you do." href="/tractors" action="Explore the catalog" />
    {shown.length > 1 ? <Loop label="Tractor models" duration={shown.length * 12} duplicate={shown.map(tractor => <HomeTractor key={tractor.id} tractor={tractor} duplicate />)}>{shown.map(tractor => <HomeTractor key={tractor.id} tractor={tractor} />)}</Loop> : shown.length === 1 ? <LocalizedElement as="div" className="home-single-tractor"><HomeTractor tractor={shown[0]} /><LocalizedElement as="div"><LocalizedElement as="p" className="home-eyebrow">BUILD YOUR SHORTLIST</LocalizedElement><LocalizedElement as="h3">Start with the work.<br />Then explore the details.</LocalizedElement><LocalizedElement as="p">Use horsepower to narrow your search, then check the full specifications of each model.</LocalizedElement><PowerRanges /></LocalizedElement></LocalizedElement> : <LocalizedElement as="div" className="home-catalog-start"><LocalizedElement as="div"><LocalizedElement as="p" className="home-eyebrow">WHERE SHOULD YOU START?</LocalizedElement><LocalizedElement as="h3">Your land. Your work.<br /><em>Your next tractor.</em></LocalizedElement><LocalizedElement as="p">Start with a horsepower range, then explore model specifications and compare your options.</LocalizedElement><PowerRanges /><LocalizedElement as="small">New models appear here when they are published.</LocalizedElement></LocalizedElement><figure><Image src="/hero/mahindra-575-di-xp-plus.webp" alt="A red Mahindra 575 DI XP Plus tractor in a field" /><LocalizedElement as="figcaption">THE DETAILS MAKE THE DIFFERENCE <Arrow /></LocalizedElement></figure></LocalizedElement>}
    {shown.length > 1 && <LocalizedElement as="div" className="home-catalog-bottom"><LocalizedElement as="span">Have a power range in mind?</LocalizedElement><PowerRanges /></LocalizedElement>}
  </LocalizedElement></section>;
}

export function HomeBrands({ title, brands, tractors }: { title: string; brands: Brand[]; tractors: Tractor[] }) {
  if (!brands.length) return null;
  return <section className="home-v2 home-brands"><LocalizedElement as="div" className="home-container home-brand-layout"><Heading eyebrow="KNOW YOUR OPTIONS" title={title} description="Explore the manufacturers, then compare the models and specifications that suit your work." href="/brands" action="All tractor brands" /><LocalizedElement as="div" className={'home-brand-cards' + (brands.length === 1 ? ' home-one-brand' : '')}>{brands.slice(0, 12).map(brand => {
    const count = tractors.filter(tractor => tractor.brandId === brand.id || tractor.brandSlug === brand.slug).length;
    return <LocalizedElement as="a" key={brand.id} href={'/brand/' + encodeURIComponent(brand.slug)}><LocalizedElement as="div" className="home-brand-logo">{brand.logo ? <Image src={brand.logo} alt={brand.name + ' logo'} /> : <LocalizedElement as="strong">{brand.name}</LocalizedElement>}</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="h3">{brand.name}</LocalizedElement><LocalizedElement as="p">{count ? count + (count === 1 ? ' listed model' : ' listed models') : 'Explore this brand'}</LocalizedElement></LocalizedElement><Arrow /></LocalizedElement>;
  })}</LocalizedElement></LocalizedElement></section>;
}

export function HomeCompare({ title }: { title: string }) {
  const comparisonCards = [
    { title: 'Power & performance', copy: 'Compare horsepower, torque and overall capability.', icon: 'tractor' },
    { title: 'Engine', copy: 'Review engine type, capacity and listed specifications.', icon: 'engine' },
    { title: 'Transmission', copy: 'Compare gear options, drive type and transmission details.', icon: 'settings' },
    { title: 'Features', copy: 'Review the saved features that support your work.', icon: 'book-2' },
  ];
  return <section className="home-v2 home-compare"><LocalizedElement as="div" className="home-container"><LocalizedElement as="div" className="home-compare-panel">
    <LocalizedElement as="div" className="home-compare-copy"><LocalizedElement as="p" className="home-eyebrow">COMPARE TRACTORS</LocalizedElement><LocalizedElement as="h2">{title}</LocalizedElement><LocalizedElement as="p">Review the specifications that matter and find the right fit for your work.</LocalizedElement><LocalizedElement as="a" className="home-button" href="/compare">Start comparing <Arrow /></LocalizedElement></LocalizedElement>
    <LocalizedElement as="div" className="home-compare-grid" aria-label="Tractor comparison categories">{comparisonCards.map(card => <article className="home-compare-card" key={card.title}>
      <LocalizedElement as="img" src={'/icons/tabler/' + card.icon + '.svg'} alt="" width={38} height={38}/><LocalizedElement as="h3">{card.title}</LocalizedElement><LocalizedElement as="span" aria-hidden="true"/><LocalizedElement as="p">{card.copy}</LocalizedElement>
    </article>)}</LocalizedElement>
  </LocalizedElement></LocalizedElement></section>;
}

export function HomeArticles({ title, articles }: { title: string; articles: SiteRecord[] }) {
  return <section className="home-v2 home-editorial"><LocalizedElement as="div" className="home-container"><Heading eyebrow="INSIGHTS & RESOURCES" title={title} description="Practical information to support your next decision, in the showroom and in the field." href="/articles" action="Explore all stories" />
    {articles.length ? <LocalizedElement as="div" className="home-story-grid" data-count={Math.min(articles.length,3)}>{articles.slice(0, 3).map((item, index) => <LocalizedElement as="a" className={index === 0 ? 'home-story home-story-feature' : 'home-story'} href={'/articles/' + encodeURIComponent(String(item.slug))} key={item.id}><LocalizedElement as="div" className="home-story-photo"><Image src={String(item.image ?? item.coverImage ?? '')} alt={String(item.title)} /><LocalizedElement as="span" className="home-story-type">{String(item.categoryName || item.category || (item.articleType === 'news' ? 'NEWS' : 'FIELD NOTES'))}</LocalizedElement></LocalizedElement><LocalizedElement as="div" className="home-story-copy"><LocalizedElement as="h3">{String(item.title)}</LocalizedElement>{item.excerpt ? <LocalizedElement as="p">{String(item.excerpt)}</LocalizedElement> : null}<LocalizedElement as="span" className="home-text-link">Read the story <Arrow /></LocalizedElement></LocalizedElement></LocalizedElement>)}</LocalizedElement> : <LocalizedElement as="div" className="home-reading-grid">{[
      ['book-2', 'Buying & research', 'Explore the latest published guides on tractor selection, features and ownership.', '/articles', 'Explore guides'],
      ['tractor', 'Equipment & implements', 'Understand the machinery behind each job and find equipment for your farm.', '/equipment', 'Explore equipment'],
      ['news', 'Industry updates', 'Read the news and farming updates published by RJ Tractor Techs.', '/news', 'Browse news'],
    ].map(([icon, label, copy, href, action], index) => <LocalizedElement as="a" href={href} key={icon}><LocalizedElement as="span" className="home-reading-number"><LocalizedElement as="img" src={'/icons/tabler/' + icon + '.svg'} alt="" width={32} height={32}/></LocalizedElement><LocalizedElement as="span" className="home-reading-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</LocalizedElement><LocalizedElement as="span" className="home-reading-accent" aria-hidden="true"/><LocalizedElement as="h3">{label}</LocalizedElement><LocalizedElement as="p">{copy}</LocalizedElement><LocalizedElement as="span" className="home-text-link">{action}<Arrow /></LocalizedElement></LocalizedElement>)}</LocalizedElement>}
  </LocalizedElement></section>;
}

export function HomeVideos({ title, videos, channelUrl }: { title: string; videos: SiteRecord[]; channelUrl?: string }) {
  if (!videos.length && !channelUrl) return null;
  if (!videos.length) return <section className="home-v2 home-videos"><LocalizedElement as="div" className="home-container"><Heading eyebrow="WATCH & LEARN" title={title} description="Tractor walkthroughs, practical demonstrations and stories from the field." href="/videos" action="Video library"/>
    <LocalizedElement as="div" className="home-video-empty"><LocalizedElement as="div" className="home-video-empty-image"><LocalizedElement as="img" src="/hero/mahindra-575-di-xp-plus.webp" alt="Red tractor in a field" loading="lazy" width={600} height={400}/></LocalizedElement><LocalizedElement as="div" className="home-video-empty-copy"><LocalizedElement as="img" className="home-youtube-icon" src="/icons/tabler/brand-youtube.svg" alt="" width={46} height={46}/><LocalizedElement as="h3">A closer look at the machines that matter.</LocalizedElement><LocalizedElement as="p">No videos have been added to the library yet. Visit our YouTube channel for tractor reviews and field demonstrations.</LocalizedElement><LocalizedElement as="a" className="home-button" href={channelUrl} target="_blank" rel="noreferrer">Explore the channel <Arrow/></LocalizedElement></LocalizedElement></LocalizedElement>
  </LocalizedElement></section>;
  return <RecentVideoCarousel videos={videos} channelUrl={channelUrl}/>;
}

function videoTime(item: SiteRecord) {
  const value = item.publishedAt ?? item.createdAt ?? item.updatedAt;
  if (value && typeof value === 'object' && 'seconds' in value) return Number((value as { seconds: unknown }).seconds) * 1000;
  const parsed = Date.parse(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function videoThumbnail(item: SiteRecord) {
  if (item.thumbnail) return String(item.thumbnail);
  const id = String(item.youtubeVideoId ?? item.youtubeId ?? '');
  return /^[\w-]{11}$/.test(id) ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

export function RecentVideoCarousel({ videos, channelUrl }: { videos: SiteRecord[]; channelUrl?: string }) {
  const recent = [...videos].sort((a, b) => videoTime(b) - videoTime(a)).slice(0, 10);
  const pages = Array.from({ length: Math.ceil(recent.length / 2) }, (_, index) => recent.slice(index * 2, index * 2 + 2));
  const [page, setPage] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (reduceMotion || pages.length < 2) return;
    const timer = window.setInterval(() => setPage(value => (value + 1) % pages.length), 4500);
    return () => window.clearInterval(timer);
  }, [pages.length, reduceMotion]);
  useEffect(() => { if (page >= pages.length) setPage(0); }, [page, pages.length]);
  return <section className="home-v2 home-videos home-video-library home-video-carousel"><LocalizedElement as="div" className="home-container">
    <LocalizedElement as="div" className="home-video-carousel-window" aria-roledescription="carousel" aria-label="Recent YouTube videos">
      <LocalizedElement as="div" className="home-video-carousel-track" style={{ transform: `translate3d(-${page * 100}%,0,0)` }}>
        {pages.map((items, pageIndex) => <LocalizedElement as="div" className="home-video-carousel-page" key={pageIndex} aria-hidden={pageIndex !== page} inert={pageIndex !== page ? true : undefined}>
          {items.map(item => <LocalizedElement as="a" href={'/videos/' + encodeURIComponent(String(item.slug))} className="home-video-card" key={item.id}>
            <LocalizedElement as="div" className="home-video-thumbnail"><Image src={videoThumbnail(item)} alt={String(item.title)} /><LocalizedElement as="span" className="home-video-play" aria-hidden="true"><LocalizedElement as="img" src="/icons/tabler/player-play.svg" alt="" width={18} height={18}/></LocalizedElement></LocalizedElement>
          </LocalizedElement>)}
        </LocalizedElement>)}
      </LocalizedElement>
    </LocalizedElement>
    {channelUrl ? <LocalizedElement as="a" className="home-video-channel" href={channelUrl} target="_blank" rel="noreferrer"><LocalizedElement as="img" src="/icons/tabler/brand-youtube.svg" alt="" width={22} height={22}/>Watch on YouTube <Arrow /></LocalizedElement> : null}
  </LocalizedElement></section>;
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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { if (reducedMotion.matches) controller.pause(); else controller.play(); };
    updateMotion();
    reducedMotion.addEventListener('change', updateMotion);
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(windowElement);
    observer?.observe(groupElement);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      reducedMotion.removeEventListener('change', updateMotion);
      controller.destroy();
    };
  }, [partners.length]);

  return <LocalizedElement as="div" className="home-loop-shell">
    <LocalizedElement as="div" ref={viewport} className="home-loop-window home-partner-window" role="region" aria-label="Partner logos">
      <LocalizedElement as="div" ref={track} className="home-partner-track">
        {Array.from({ length: copies }, (_, copy) => <LocalizedElement as="div" className="home-partner-group" key={copy} ref={copy === 0 ? firstGroup : undefined} aria-hidden={copy > 0 ? true : undefined} inert={copy > 0 ? true : undefined}>
          {partners.map(partner => <LocalizedElement as="div" className="home-partner-logo" key={partner.id}><Image src={partner.image} alt={copy === 0 ? partner.title : ''} /></LocalizedElement>)}
        </LocalizedElement>)}
      </LocalizedElement>
    </LocalizedElement>
  </LocalizedElement>;
}

export function HomePartners({ title, partners }: { title: string; partners: Partner[] }) {
  if (!partners.length) return null;
  return <section className="home-v2 home-partners" aria-label={title}><LocalizedElement as="div" className="home-container partner-heading"><LocalizedElement as="h2">{title}</LocalizedElement></LocalizedElement><PartnerLogoCarousel partners={partners} /></section>;
}
