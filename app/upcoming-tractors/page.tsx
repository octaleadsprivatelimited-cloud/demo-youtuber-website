import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import {TractorCollectionPage} from '@/components/TractorCollectionPage';const pageMetadata: Metadata = {alternates:{canonical:'/upcoming-tractors'},title:'Upcoming Tractors | RJ Tractor Techs',description:'Research expected upcoming tractors and unconfirmed launch information.'};
export async function generateMetadata() { return withSeoOverride('/upcoming-tractors', pageMetadata); }export default function Page(){return <TractorCollectionPage mode="upcoming"/>}
