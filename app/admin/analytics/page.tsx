'use client';
import {useEffect,useState} from 'react';
import {AdminShell} from '@/components/admin/AdminShell';
import {listLeads,type Lead} from '@/services/leads';
import {listLocalAnalytics,type LocalAnalyticsEvent} from '@/services/analytics';
import {isLocalDemo} from '@/lib/firebase/client';
export default function AnalyticsPage(){
  const [leads,setLeads]=useState<Lead[]>([]);const [events,setEvents]=useState<LocalAnalyticsEvent[]>([]);
  const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  async function load(){setLoading(true);setError('');try{const [rows,activity]=await Promise.all([listLeads({}),isLocalDemo?listLocalAnalytics():Promise.resolve([])]);setLeads(rows);setEvents(activity);}catch(reason){setError(reason instanceof Error?reason.message:'Unable to load analytics.');}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  const count=(name:string)=>events.filter(item=>item.name===name).length;
  const sources=leads.reduce<Record<string,number>>((all,item)=>({...all,[item.source]:(all[item.source]||0)+1}),{});
  return <AdminShell><header className="admin-heading"><div><p>PERFORMANCE</p><h1>Analytics</h1><span>Enquiry totals for the latest 100 leads.{isLocalDemo?' Local interaction totals cover the latest 1,000 recorded events.':' Website traffic is available in Firebase Analytics.'}</span></div><button disabled={loading} onClick={()=>void load()}>{loading?'Loading…':'Refresh'}</button></header>
    {error&&<div className="admin-error" role="alert">{error}</div>}
    <div className="crm-metrics">{isLocalDemo&&<><article><span>Page views</span><strong>{count('page_view')}</strong></article><article><span>Tractor views</span><strong>{count('tractor_view')}</strong></article><article><span>Searches</span><strong>{count('search')}</strong></article></>}<article><span>Converted leads</span><strong>{leads.filter(item=>item.status==='Converted').length}</strong></article></div>
    <section className="admin-panel"><h2>Lead sources</h2>{!leads.length?<p>No enquiries recorded.</p>:<div className="analytics-bars">{Object.entries(sources).map(([name,value])=><div key={name}><span>{name}</span><i style={{width:`${value/leads.length*100}%`}}/><strong>{value}</strong></div>)}</div>}</section>
  </AdminShell>;
}
