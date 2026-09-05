'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import {useState} from 'react';
import {subscribeNewsletter} from '@/services/public-content';
export function Newsletter(){const [email,setEmail]=useState('');const [state,setState]=useState('');async function submit(e:React.FormEvent){e.preventDefault();setState('Saving…');try{await subscribeNewsletter(email);setEmail('');setState('Subscribed. Thank you.');}catch{setState('Connect Firebase to enable subscriptions.');}}return <section className="newsletter"><LocalizedElement as="div"><LocalizedElement as="p">RJ FIELD NOTES</LocalizedElement><LocalizedElement as="h2">Useful tractor and farming updates.</LocalizedElement><LocalizedElement as="span">Occasional editorial updates. No invented offers or subscriber claims.</LocalizedElement></LocalizedElement><form onSubmit={submit}><LocalizedElement as="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" aria-label="Email address"/><LocalizedElement as="button">Subscribe</LocalizedElement><LocalizedElement as="small" aria-live="polite">{state}</LocalizedElement></form></section>}
