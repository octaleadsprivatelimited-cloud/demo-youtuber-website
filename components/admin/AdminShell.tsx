'use client';
import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {useAdmin} from '@/hooks/useAdmin';
import {SetupNotice} from '@/components/SetupNotice';
import {isFirebaseConfigured} from '@/lib/firebase/client';
import {adminSections} from '@/config/admin-sections';

export function AdminShell({children}: {children:ReactNode}){const {user,role,loading,isAdmin}=useAdmin();const path=usePathname();if(!isFirebaseConfigured)return <main className="crm-page"><SetupNotice/></main>;if(loading)return <div className="detail-loading">Checking admin access…</div>;if(!user)return <main className="admin-gate"><h1>Admin sign-in required</h1><a href="/login">Sign in →</a></main>;if(!isAdmin)return <main className="admin-gate"><h1>Access restricted</h1><p>Your account does not have an active administrator role.</p><a href="/">Return to website</a></main>;const links=[['/admin','Overview'],['/admin/leads','Lead CRM'],...Object.entries(adminSections).map(([key,value])=>[`/admin/${key}`,value.label]),['/admin/users','Users'],['/admin/analytics','Analytics']];return <main className="crm-page admin-workspace"><aside className="crm-sidebar"><a className="brand" href="/"><span className="brand-mark">RJ</span><span className="brand-copy"><strong>Admin</strong><small>TRACTOR TECHS</small></span></a><nav>{links.map(([href,label])=><a key={href} className={path===href?'active':''} href={href}>{label}</a>)}<a href="/">View website ↗</a></nav><div><span>Signed in as</span><strong>{user.email}</strong><small>{role}</small></div></aside><section className="crm-main">{children}</section></main>}
