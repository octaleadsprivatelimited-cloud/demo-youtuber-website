'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

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
  return <AdminShell><header className="admin-heading"><LocalizedElement as="div"><LocalizedElement as="p">PERFORMANCE</LocalizedElement><LocalizedElement as="h1">Analytics</LocalizedElement><LocalizedElement as="span">Enquiry totals for the latest 100 leads.{isLocalDemo?' Local interaction totals cover the latest 1,000 recorded events.':' Website traffic is available in Firebase Analytics.'}</LocalizedElement></LocalizedElement><LocalizedElement as="button" disabled={loading} onClick={()=>void load()}>{loading?'Loading…':'Refresh'}</LocalizedElement></header>
    {error&&<LocalizedElement as="div" className="admin-error" role="alert">{error}</LocalizedElement>}
    <LocalizedElement as="div" className="crm-metrics">{isLocalDemo&&<><article><LocalizedElement as="span">Page views</LocalizedElement><LocalizedElement as="strong">{count('page_view')}</LocalizedElement></article><article><LocalizedElement as="span">Tractor views</LocalizedElement><LocalizedElement as="strong">{count('tractor_view')}</LocalizedElement></article><article><LocalizedElement as="span">Searches</LocalizedElement><LocalizedElement as="strong">{count('search')}</LocalizedElement></article></>}<article><LocalizedElement as="span">Converted leads</LocalizedElement><LocalizedElement as="strong">{leads.filter(item=>item.status==='Converted').length}</LocalizedElement></article></LocalizedElement>
    <section className="admin-panel"><LocalizedElement as="h2">Lead sources</LocalizedElement>{!leads.length?<LocalizedElement as="p">No enquiries recorded.</LocalizedElement>:<LocalizedElement as="div" className="analytics-bars">{Object.entries(sources).map(([name,value])=><LocalizedElement as="div" key={name}><LocalizedElement as="span">{name}</LocalizedElement><i style={{width:`${value/leads.length*100}%`}}/><LocalizedElement as="strong">{value}</LocalizedElement></LocalizedElement>)}</LocalizedElement>}</section>
  </AdminShell>;
}
