import { withSeoOverride } from '@/lib/seo-metadata';
import type { Metadata } from 'next';
import {AboutPage} from '@/components/AboutPage';
const pageMetadata: Metadata = {alternates:{canonical:'/about'},title:'About RJ Tractor Techs',description:'A place to explore tractors, understand the details and make your next shortlist.'};
export async function generateMetadata() { return withSeoOverride('/about', pageMetadata); }
export default function About(){return <AboutPage/>;}
