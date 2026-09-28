'use client';
import { useId, useState } from 'react';
import { calculateEmi } from '@/lib/emi';
import './product-emi.css';

const money = (value: number) => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export function ProductEmiCalculator({ name, price: savedPrice }: { name: string; price?: number }) {
  const id = useId();
  const available = Number.isFinite(savedPrice) && Number(savedPrice) > 0;
  const [amount, setAmount] = useState(available ? String(Math.round(Number(savedPrice) * 0.8)) : '');
  const [rate, setRate] = useState('10.5');
  const [months, setMonths] = useState('60');
  const result = [amount,rate,months].every(value=>value.trim() !== '') && Number(rate) <= 30 && Number(months) >= 12 && Number(months) <= 96 ? calculateEmi(Number(amount),0,Number(rate),Number(months)) : null;
  const maximum = Math.max(5000000, available ? Number(savedPrice) : 0, Number(amount) || 0);
  const controls = [
    {label:'Loan amount', value:amount, set:setAmount, min:0, max:maximum, step:1000, unit:'₹', low:'₹0', high:money(maximum), display:money(Number(amount)||0)},
    {label:'Tenure', value:months, set:setMonths, min:12, max:96, step:1, unit:'months', low:'1 year', high:'8 years', display:`${Number(months)/12 % 1 === 0 ? Number(months)/12 + ' years' : months + ' months'}`},
    {label:'Interest', value:rate, set:setRate, min:0, max:30, step:0.1, unit:'% p.a.', low:'0%', high:'30%', display:`${rate || '0'}%`},
  ];
  return <section className="product-emi" id="product-emi" aria-labelledby={id}>
    <header><h2 id={id}>Customize your loan EMI</h2><p>{name} · Adjust the loan amount, tenure and interest rate.</p></header>
    <div className="product-emi-layout"><div className="product-emi-controls">
      <div className="product-emi-headline" aria-live="polite"><strong>{result ? money(result.emi) : '—'}</strong><span>EMI for {months || '—'} months</span></div>
      <p className="product-emi-price-note">{available ? `Listed price ${money(Number(savedPrice))}. Initial loan amount assumes 20% down payment.` : 'Price not listed. Enter the amount you intend to borrow.'}</p>
      {controls.map(control=><div className="product-emi-control" key={control.label}>
        <label htmlFor={`${id}-${control.label}`}>{control.label}: <strong>{control.display}</strong></label>
        <input className="product-emi-range" aria-label={`${control.label} slider`} type="range" min={control.min} max={control.max} step={control.step} value={Math.max(control.min,Math.min(control.max,Number(control.value)||0))} onChange={event=>control.set(event.target.value)}/>
        <div className="product-emi-limits"><span>{control.low}</span><span>{control.high}</span></div>
        <div className="product-emi-number"><span>{control.unit}</span><input id={`${id}-${control.label}`} type="number" min={control.label==='Loan amount'?1:control.min} max={control.max} step={control.label==='Tenure'?1:'any'} inputMode="decimal" value={control.value} onChange={event=>control.set(event.target.value)}/></div>
      </div>)}
    </div><div className="product-emi-breakdown">
      {!result ? <p className="product-emi-empty">Enter a loan amount above zero, an interest rate from 0–30%, and a tenure of 12–96 whole months.</p> : <>
        <dl className="product-emi-totals"><div><dt><i/>Principal loan amount</dt><dd>{money(result.principal)}</dd></div><div><dt><i/>Total interest payable</dt><dd>{money(result.interest)}</dd></div><div><dt>Total amount payable</dt><dd>{money(result.total)}</dd></div></dl>
      </>}
    </div></div>
    <small>Illustrative estimate. The default rate is an example, not a lender offer. Processing fees, insurance and taxes are excluded. Confirm final terms with your lender.</small>
  </section>;
}
