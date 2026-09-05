'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useState } from 'react';
import { EditorialReviews } from '@/components/EditorialReviews';
import { HomepageHeader } from '@/components/HomepageHeader';
import { HomepageHero } from '@/components/HomepageHero';
import { HomepagePromotions } from '@/components/HomepagePromotions';
import { SiteFooter, useSiteSettings } from '@/components/SiteChrome';
import {
  HomeIntroduction,
  HomeBrands,
  HomeCompare,
  HomeArticles,
  HomeVideos,
  HomePartners,
} from '@/components/HomepageSections';
import { TractorShowcase } from '@/components/TractorShowcase';
import { useTractorCatalog } from '@/hooks/useTractorCatalog';
import { subscribeHeroSlides, type HeroSlide } from '@/services/hero-slides';
import { subscribePartners, type Partner } from '@/services/partners';
import { usePublicRecords } from '@/hooks/usePublicRecords';
import { resolveHomepageSections } from '@/config/homepage-sections';
import '@/app/reference-home.css';
import '@/app/automotive-home.css';

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [partners, setPartners] = useState<Partner[]>([]);
  const { items: tractors, loading: tractorsLoading, error: tractorsError, retry: retryTractors } =
    useTractorCatalog();
  const { items: brandRecords } = usePublicRecords('brands');
  const { items: articles } = usePublicRecords('articles');
  const { items: videos } = usePublicRecords('videos');
  const { items: sectionRecords } = usePublicRecords('homepageSections');
  const settings = useSiteSettings();
  const brands = brandRecords.map((row) => ({ ...row, name: String(row.name ?? row.title ?? ''), slug: String(row.slug), logo: String(row.logo ?? '') }));
  const youtube = settings.youtube || 'https://www.youtube.com/@Rjtractortechs';

  useEffect(() => subscribeHeroSlides((slides) => {
    setHeroSlides(slides);
    setHeroIndex(0);
  }), []);
  useEffect(() => subscribePartners(setPartners), []);
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(
      () => setHeroIndex((index) => (index + 1) % heroSlides.length),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.reference-home > main');
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    const prepare = () => {
      root.querySelectorAll<HTMLElement>(':scope > section').forEach((section) => {
        if (!section.classList.contains('home-scroll-reveal')) {
          section.classList.add('home-scroll-reveal');
          observer.observe(section);
        }
        section.querySelectorAll<HTMLElement>('.tractor-card,.home-brand-card,.home-compare-card,.home-article-card,.home-video-card,.cms-home-card')
          .forEach((item, index) => {
            item.classList.add('home-scroll-item');
            item.style.setProperty('--reveal-order', String(index % 8));
          });
      });
    };
    prepare();
    const mutations = new MutationObserver(prepare);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  function renderSection(key: string, title: string) {
    if (key === 'hero') return <HomepageHero title={title} slides={heroSlides} index={heroIndex} onSlide={setHeroIndex} brands={brands} />;
    if (key === 'tractors') return <TractorShowcase title={title} tractors={tractors} loading={tractorsLoading} error={tractorsError} onRetry={retryTractors} design="reference" />;
    if (key === 'reviews') return <EditorialReviews title={title} />;
    if (key === 'compare') return <HomeCompare title={title} />;
    if (key === 'articles') return <HomeArticles title={title} articles={articles} />;
    if (key === 'videos') return <HomeVideos title={title} videos={videos} channelUrl={youtube} />;
    if (key === 'partners') return <HomePartners title={title} partners={partners} />;
    if (key === 'promotions') return <HomepagePromotions title={title} />;
    if (key === 'introduction') return <HomeIntroduction title={title} />;
    if (key === 'brands') return <HomeBrands title={title} brands={brands} tractors={tractors} />;
    return null;
  }

  return (
    <LocalizedElement as="div" className="reference-home">
      <HomepageHeader />
      <main>{resolveHomepageSections(sectionRecords).map((section) => (
        <HomeSection key={section.key}>{renderSection(section.key, section.title)}</HomeSection>
      ))}</main>
      <LocalizedElement as="div" className="home-v2 home-footer">
        <SiteFooter />
      </LocalizedElement>
    </LocalizedElement>
  );
}

function HomeSection({ children }: { children: React.ReactNode }) {
  return children;
}
