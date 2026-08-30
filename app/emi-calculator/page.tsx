'use client';
import { useEffect,useMemo,useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { LeadForm } from '@/components/LeadForm';
import { trackEvent } from '@/services/analytics';
function money(value:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number.isFinite(value)?value:0);}
export default function EmiCalculatorPage(){
 const [price,setPrice]=useState(800000),[down,setDown]=useState(160000),[rate,setRate]=useState(10.5),[years,setYears]=useState(5),[tracked,setTracked]=useState(false);
 useEffect(()=>{const value=Number(new URLSearchParams(window.location.search).get('price'));if(Number.isFinite(value)&&value>0){setPrice(value);setDown(Math.round(value*.2));}},[]);
 const result=useMemo(()=>{const principal=Math.max(price-down,0),months=Math.max(years*12,1),monthlyRate=rate/1200;const emi=monthlyRate===0?principal/months:principal*monthlyRate*Math.pow(1+monthlyRate,months)/(Math.pow(1+monthlyRate,months)-1),total=emi*months;return{principal,emi,total,interest:total-principal};},[price,down,rate,years]);
 const loanShare=result.total?Math.round(result.principal/result.total*100):100;
 function record(){if(!tracked){setTracked(true);trackEvent('emi_calculation',{tractor_price:price,loan_amount:result.principal,tenure_years:years});}}
 function choosePrice(value:number){setPrice(value);setDown(Math.round(value*.2));record();}
 return <PublicShell><main className="emi-page">
  <section className="page-hero emi-hero"><div><p>FINANCE PLANNING</p><h1>Plan your tractor payment.</h1><span>Estimate a practical monthly payment before you visit the dealership. Adjust every figure to match your quotation.</span></div><div className="emi-hero-note"><strong>No signup required</strong><span>Instant estimate · editable values · transparent breakdown</span></div></section>
  <section className="emi-workspace"><div className="emi-inputs"><header><div><p>STEP 01</p><h2>Set your loan details</h2></div><span>All values are editable</span></header>
   <div className="emi-presets" aria-label="Quick tractor price presets">{[600000,800000,1000000,1500000].map(value=><button key={value} className={price===value?'active':''} type="button" onClick={()=>choosePrice(value)}>{money(value)}</button>)}</div>
   <label><span>Tractor price</span><strong>{money(price)}</strong><input type="range" min="200000" max="3000000" step="10000" value={price} onChange={event=>{const value=Math.max(0,Number(event.target.value));setPrice(value);setDown(current=>Math.min(current,value));record();}}/><input aria-label="Tractor price value" type="number" min="0" value={price} onChange={event=>{const value=Math.max(0,Number(event.target.value));setPrice(value);setDown(current=>Math.min(current,value));}}/></label>
   <label><span>Down payment</span><strong>{money(down)}</strong><input type="range" min="0" max={price} step="10000" value={Math.min(down,price)} onChange={event=>setDown(Math.min(price,Math.max(0,Number(event.target.value))))}/><input aria-label="Down payment value" type="number" min="0" max={price} value={down} onChange={event=>setDown(Math.min(price,Math.max(0,Number(event.target.value))))}/></label>
   <div className="emi-inline-fields"><label><span>Interest rate</span><strong>{rate}%</strong><input type="range" min="0" max="20" step=".1" value={rate} onChange={event=>setRate(Number(event.target.value))}/></label><label><span>Loan tenure</span><strong>{years} years</strong><input type="range" min="1" max="10" step="1" value={years} onChange={event=>setYears(Number(event.target.value))}/></label></div>
  </div><aside className="emi-results"><div className="emi-result-heading"><p>YOUR ESTIMATE</p><span>{years*12} monthly payments</span></div><small>Estimated monthly EMI</small><h2>{money(result.emi)}</h2><div className="emi-payment-bar" aria-label={`${loanShare}% principal and ${100-loanShare}% interest`}><i style={{width:`${loanShare}%`}}/></div><div className="emi-legend"><span><i/>Principal</span><span><i/>Interest</span></div><div className="emi-result-grid"><span>Loan amount<strong>{money(result.principal)}</strong></span><span>Total interest<strong>{money(result.interest)}</strong></span><span>Total payable<strong>{money(result.total)}</strong></span></div><div className="emi-disclaimer">Indicative calculation only. Your lender determines the final rate, fees and eligibility.</div></aside></section>
  <section className="emi-enquiry"><div className="emi-enquiry-intro"><p>NEXT STEP</p><h2>Want help with your shortlist?</h2><span>Share your details and the RJ Tractor Techs team can help you continue your research.</span></div><LeadForm source="emi_calculator"/></section>
 </main></PublicShell>;
}
