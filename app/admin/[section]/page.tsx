'use client';
import { LocalizedElement } from '@/components/LocalizedElement';

import {useParams} from 'next/navigation';
import {AdminShell} from '@/components/admin/AdminShell';
import {AdminCrud} from '@/components/admin/AdminCrud';
import {PromotionsAdmin} from '@/components/admin/PromotionsAdmin';
import {adminSections} from '@/config/admin-sections';
export default function AdminSectionPage(){
  const {section:key}=useParams<{section:string}>();
  if(['promotions','banners','advertisements'].includes(key))return <AdminShell><PromotionsAdmin key={key} initialType={key==='advertisements'?'advertisements':'banners'}/></AdminShell>;
  const section=adminSections[key];
  return <AdminShell>{section?<AdminCrud key={key} section={section}/>:<LocalizedElement as="div" className="empty-state"><LocalizedElement as="h1">Section not found</LocalizedElement><LocalizedElement as="a" href="/admin">Return to dashboard</LocalizedElement></LocalizedElement>}</AdminShell>;
}
