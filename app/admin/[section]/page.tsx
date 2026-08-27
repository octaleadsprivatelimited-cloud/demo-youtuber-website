'use client';
import {useParams} from 'next/navigation';
import {AdminShell} from '@/components/admin/AdminShell';
import {AdminCrud} from '@/components/admin/AdminCrud';
import {PromotionsAdmin} from '@/components/admin/PromotionsAdmin';
import {adminSections} from '@/config/admin-sections';
export default function AdminSectionPage(){
  const {section:key}=useParams<{section:string}>();
  if(['promotions','banners','advertisements'].includes(key))return <AdminShell><PromotionsAdmin initialType={key==='advertisements'?'advertisements':'banners'}/></AdminShell>;
  const section=adminSections[key];
  return <AdminShell>{section?<AdminCrud key={key} section={section}/>:<div className="empty-state"><h1>Section not found</h1><a href="/admin">Return to dashboard</a></div>}</AdminShell>;
}
