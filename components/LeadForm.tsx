'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createLead } from '@/services/leads';
import { trackEvent } from '@/services/analytics';

export function LeadForm({tractorId,tractorName,dealerId,source='website'}:{tractorId?:string;tractorName?:string;dealerId?:string;source?:string}){
 const {user}=useAuth();const [form,setForm]=useState({name:user?.displayName??'',phone:'',email:user?.email??'',city:'',state:'',message:''});const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function submit(event:React.FormEvent){event.preventDefault();setBusy(true);setMessage('');try{await createLead({...form,tractorId,tractorName,dealerId,source,userId:user?.uid});await trackEvent('lead_submission',{source,tractor:tractorName});setMessage('Thanks. Your enquiry has been received.');setForm(current=>({...current,phone:'',message:''}));}catch(reason){setMessage(reason instanceof Error?reason.message:'Unable to send enquiry.');}finally{setBusy(false);}}
 return <form className="lead-form" onSubmit={submit}><LocalizedElement as="p">REQUEST INFORMATION</LocalizedElement><LocalizedElement as="h3">{tractorName?'Interested in '+tractorName+'?':'Talk to RJ Tractor Techs'}</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="label">Name<LocalizedElement as="input" required value={form.name} onChange={event=>setForm({...form,name:event.target.value})}/></LocalizedElement><LocalizedElement as="label">Phone<LocalizedElement as="input" required inputMode="tel" pattern="[0-9+ -]{8,15}" value={form.phone} onChange={event=>setForm({...form,phone:event.target.value})}/></LocalizedElement><LocalizedElement as="label">Email<LocalizedElement as="input" type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})}/></LocalizedElement><LocalizedElement as="label">City<LocalizedElement as="input" required value={form.city} onChange={event=>setForm({...form,city:event.target.value})}/></LocalizedElement><LocalizedElement as="label">State<LocalizedElement as="input" required value={form.state} onChange={event=>setForm({...form,state:event.target.value})}/></LocalizedElement><LocalizedElement as="label" className="full">Message<LocalizedElement as="textarea" maxLength={1000} value={form.message} onChange={event=>setForm({...form,message:event.target.value})}/></LocalizedElement></LocalizedElement>{message&&<LocalizedElement as="span">{message}</LocalizedElement>}<LocalizedElement as="button" disabled={busy}>{busy?'Sending…':'Send enquiry →'}</LocalizedElement></form>;
}

