'use client';
import { useEffect, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { ProductEmiCalculator } from '@/components/ProductEmiCalculator';

export default function EmiCalculatorPage() {
  const [price, setPrice] = useState(800000);
  useEffect(() => {
    const supplied = Number(new URLSearchParams(window.location.search).get('price'));
    if (Number.isFinite(supplied) && supplied > 0) setPrice(supplied);
  }, []);
  return <PublicShell><main style={{maxWidth:1100,margin:'auto',padding:'36px 20px 64px'}}><h1>Tractor & equipment EMI calculator</h1><ProductEmiCalculator key={price} name="Plan your product financing" price={price}/></main></PublicShell>;
}
