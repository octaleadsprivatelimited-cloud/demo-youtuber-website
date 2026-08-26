'use client';

import { useEffect,useState } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { getAdminRole } from '@/services/leads';

export function useAdmin(){const {user,loading:authLoading}=useAuth();const [role,setRole]=useState<string|null>(null);const [loading,setLoading]=useState(true);useEffect(()=>{if(authLoading)return;if(!user||!isFirebaseConfigured){setRole(null);setLoading(false);return;}setLoading(true);getAdminRole(user.uid).then(setRole).catch(()=>setRole(null)).finally(()=>setLoading(false));},[user,authLoading]);return{user,role,loading,isAdmin:Boolean(role)};}

