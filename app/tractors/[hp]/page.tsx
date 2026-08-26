import HorsepowerPageClient from './horsepower-page-client';

export default async function HorsepowerPage({params}:{params:Promise<{hp:string}>}){return <HorsepowerPageClient hpSlug={(await params).hp}/>;}

