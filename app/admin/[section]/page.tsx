'use client';
import {useParams} from 'next/navigation';
import {AdminShell} from '@/components/admin/AdminShell';
import {AdminCrudClean} from '@/components/admin/AdminCrudClean';
import {HeroSlidesAdminV2} from '@/components/admin/HeroSlidesAdminV2';
import {adminSections} from '@/config/admin-sections';

export default function AdminSectionPage(){const params=useParams<{section:string}>();const section=adminSections[params.section];if(!section)return <AdminShell><div className="empty-state"><h1>Section not found</h1><a href="/admin">Return to dashboard</a></div></AdminShell>;return <AdminShell>{params.section==='hero-slides'?<HeroSlidesAdminV2/>:<AdminCrudClean section={section}/>}</AdminShell>}
