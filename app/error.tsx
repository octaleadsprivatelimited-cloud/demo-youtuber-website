'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="system-state"><LocalizedElement as="p">SOMETHING WENT WRONG</LocalizedElement><LocalizedElement as="h1">We could not load this page.</LocalizedElement><LocalizedElement as="span">Please retry. If the problem continues, return to the homepage.</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="button" className="cta-primary" onClick={reset}>Try again</LocalizedElement><LocalizedElement as="a" className="cta-secondary" href="/">Return home</LocalizedElement></LocalizedElement></main>}
