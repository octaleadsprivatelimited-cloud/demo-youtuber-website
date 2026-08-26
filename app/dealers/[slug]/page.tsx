import DealerDetailClient from './dealer-detail-client';
export default async function DealerPage({params}:{params:Promise<{slug:string}>}){return <DealerDetailClient slug={(await params).slug}/>;}

