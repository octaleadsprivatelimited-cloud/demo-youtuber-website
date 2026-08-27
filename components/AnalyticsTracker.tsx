'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {trackEvent} from '@/services/analytics';
export function AnalyticsTracker(){const path=usePathname();useEffect(()=>{if(path&&!path.startsWith('/admin'))trackEvent('page_view',{page_path:path});},[path]);return null;}
