'use client';
import { useId, useState } from 'react';
import { calculateEmi } from '@/lib/emi';
import './product-emi.css';

const money = (value: number) => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export function ProductEmiCalculator({ name, price: savedPrice }: { name: string; price?: number }) {
  const id = useId();
  const available = Number.isFinite(savedPrice) && Number(savedPrice) > 0;
  const [price, setPrice] = useState(available ? String(savedPrice) : '');
  const [down, setDown] = useState(available ? String(Math.round(Number(savedPrice) * 0.2)) : '0');
  const [rate, setRate] = useState('10.5');
  const [months, setMonths] = useState('60');
  const result = [price,down,rate,months].every(value=>value.trim() !== '') ? calculateEmi(Number(price),Number(down),Number(rate),Number(months)) : null;
  return <section className="product-emi" id="product-emi" aria-labelledby={id}>
    <header><p>FINANCE PLANNING</p><h2 id={id}>EMI calculator</h2><p>Estimate monthly payments for {name}.</p></header>
    {!available && <p>The product price is not listed. Enter your dealer’s quoted price to calculate.</p>}
    <div className="product-emi-layout"><div className="product-emi-fields">
      <label>Product price (₹)<input type="number" min="1" step="any" inputMode="decimal" value={price} onChange={event=>setPrice(event.target.value)}/></label>
      <label>Down payment (₹)<input type="number" min="0" max={price || undefined} step="any" inputMode="decimal" value={down} onChange={event=>setDown(event.target.value)}/></label>
      <label>Annual interest (%)<input type="number" min="0" max="100" step="any" inputMode="decimal" value={rate} onChange={event=>setRate(event.target.value)}/></label>
      <label>Loan tenure (months)<input type="number" min="1" max="360" step="1" inputMode="numeric" value={months} onChange={event=>setMonths(event.target.value)}/></label>
    </div><div className="product-emi-result" aria-live="polite">{result ? <><span>Estimated monthly EMI</span><strong>{money(result.emi)}</strong><dl><div><dt>Loan amount</dt><dd>{money(result.principal)}</dd></div><div><dt>Total interest</dt><dd>{money(result.interest)}</dd></div><div><dt>Total loan repayment</dt><dd>{money(result.total)}</dd></div></dl></> : <p>Enter a valid price and loan details. Down payment cannot exceed the price; tenure must be 1–360 whole months.</p>}</div></div>
    <small>Illustrative estimate using your inputs. The default interest rate is an example, not a lender offer. Fees, insurance and taxes are excluded; confirm final terms with your lender.</small>
  </section>;
}
