import type { Metadata } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SeoJsonLd } from '@/components/SeoJsonLd';

const body = DM_Sans({ variable: '--font-body', subsets: ['latin'] });
const display = Manrope({ variable: '--font-display', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'RJ Tractor Techs | Tractor Reviews, Specs & Farming Information',
  description: 'Explore tractor specifications, prices, expert reviews, comparisons, new launches and practical farming information.',
  openGraph: {
    title: 'RJ Tractor Techs',
    description: 'Tractor Reviews, Specs & Farming Information',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RJ Tractor Techs',
    description: 'Tractor Reviews, Specs & Farming Information',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site=process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const structuredData=[{'@context':'https://schema.org','@type':'Organization',name:'RJ Tractor Techs',url:site,sameAs:['https://www.youtube.com/@Rjtractortechs']},{'@context':'https://schema.org','@type':'WebSite',name:'RJ Tractor Techs',url:site,potentialAction:{'@type':'SearchAction',target:`${site}/tractors?search={search_term_string}`,'query-input':'required name=search_term_string'}}];
  return <html lang="en"><body className={`${body.variable} ${display.variable}`}><SeoJsonLd data={structuredData}/><Providers>{children}</Providers></body></html>;
}
