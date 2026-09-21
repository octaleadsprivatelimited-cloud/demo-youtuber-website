import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import {TractorCollectionPage} from '@/components/TractorCollectionPage';const pageMetadata: Metadata = {alternates:{canonical:'/new-tractors'},title:'New Tractors | RJ Tractor Techs',description:'Explore recently launched tractors, prices and specifications.'};
export async function generateMetadata() { return withSeoOverride('/new-tractors', pageMetadata); }export default function Page(){return <TractorCollectionPage mode="new"/>}
