'use client';
import { AdminCrudClean } from './AdminCrudClean';
import { adminSections } from '@/config/admin-sections';
export function HeroSlidesAdmin() { return <AdminCrudClean section={adminSections['hero-slides']}/>; }
