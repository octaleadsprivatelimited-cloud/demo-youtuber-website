'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { LeadForm } from '@/components/LeadForm';
import { trackEvent } from '@/services/analytics';

function money(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );
}

export default function EmiCalculatorPage() {
  const [price, setPrice] = useState(800000);
  const [down, setDown] = useState(160000);
  const [rate, setRate] = useState(10.5);
  const [years, setYears] = useState(5);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    const value = Number(new URLSearchParams(window.location.search).get('price'));
    if (Number.isFinite(value) && value > 0) {
      setPrice(value);
      setDown(Math.round(value * 0.2));
    }
  }, []);

  const result = useMemo(() => {
    const principal = Math.max(price - down, 0);
    const months = Math.max(years * 12, 1);
    const monthlyRate = rate / 1200;
    const emi =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
    const total = emi * months;
    return { principal, emi, total, interest: total - principal };
  }, [price, down, rate, years]);

  const loanShare = result.total ? Math.round((result.principal / result.total) * 100) : 100;

  function record() {
    if (!tracked) {
      setTracked(true);
      trackEvent('emi_calculation', {
        tractor_price: price,
        loan_amount: result.principal,
        tenure_years: years,
      });
    }
  }

  function choosePrice(value: number) {
    setPrice(value);
    setDown(Math.round(value * 0.2));
    record();
  }

  return (
    <PublicShell>
      <main className="emi-page">
        <section className="page-hero emi-hero">
          <LocalizedElement as="div">
            <LocalizedElement as="p">FINANCE PLANNING</LocalizedElement>
            <LocalizedElement as="h1">Plan your tractor payment.</LocalizedElement>
            <LocalizedElement as="span">Estimate a practical monthly payment before you visit the dealership. Adjust every figure to match your quotation.</LocalizedElement>
          </LocalizedElement>
          <LocalizedElement as="div" className="emi-hero-note">
            <LocalizedElement as="strong">No signup required</LocalizedElement>
            <LocalizedElement as="span">Instant estimate · editable values · transparent breakdown</LocalizedElement>
          </LocalizedElement>
        </section>
        <section className="emi-workspace">
          <LocalizedElement as="div" className="emi-inputs">
            <header>
              <LocalizedElement as="div">
                <LocalizedElement as="p">STEP 01</LocalizedElement>
                <LocalizedElement as="h2">Set your loan details</LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="span">All values are editable</LocalizedElement>
            </header>
            <LocalizedElement as="div" className="emi-presets" aria-label="Quick tractor price presets">
              {[600000, 800000, 1000000, 1500000].map((value) => (
                <LocalizedElement as="button"
                  key={value}
                  className={price === value ? 'active' : ''}
                  type="button"
                  onClick={() => choosePrice(value)}
                >
                  {money(value)}
                </LocalizedElement>
              ))}
            </LocalizedElement>
            <LocalizedElement as="label">
              <LocalizedElement as="span">Tractor price</LocalizedElement>
              <LocalizedElement as="strong">{money(price)}</LocalizedElement>
              <LocalizedElement as="input"
                type="range"
                min="200000"
                max="3000000"
                step="10000"
                value={price}
                onChange={(event) => {
                  const value = Math.max(0, Number(event.target.value));
                  setPrice(value);
                  setDown((current) => Math.min(current, value));
                  record();
                }}
              />
              <LocalizedElement as="input"
                aria-label="Tractor price value"
                type="number"
                min="0"
                value={price}
                onChange={(event) => {
                  const value = Math.max(0, Number(event.target.value));
                  setPrice(value);
                  setDown((current) => Math.min(current, value));
                }}
              />
            </LocalizedElement>
            <LocalizedElement as="label">
              <LocalizedElement as="span">Down payment</LocalizedElement>
              <LocalizedElement as="strong">{money(down)}</LocalizedElement>
              <LocalizedElement as="input"
                type="range"
                min="0"
                max={price}
                step="10000"
                value={Math.min(down, price)}
                onChange={(event) => setDown(Math.min(price, Math.max(0, Number(event.target.value))))}
              />
              <LocalizedElement as="input"
                aria-label="Down payment value"
                type="number"
                min="0"
                max={price}
                value={down}
                onChange={(event) => setDown(Math.min(price, Math.max(0, Number(event.target.value))))}
              />
            </LocalizedElement>
            <LocalizedElement as="div" className="emi-inline-fields">
              <LocalizedElement as="label">
                <LocalizedElement as="span">Interest rate</LocalizedElement>
                <LocalizedElement as="strong">{rate}%</LocalizedElement>
                <LocalizedElement as="input"
                  type="range"
                  min="0"
                  max="20"
                  step=".1"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                />
              </LocalizedElement>
              <LocalizedElement as="label">
                <LocalizedElement as="span">Loan tenure</LocalizedElement>
                <LocalizedElement as="strong">{years} years</LocalizedElement>
                <LocalizedElement as="input"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={years}
                  onChange={(event) => setYears(Number(event.target.value))}
                />
              </LocalizedElement>
            </LocalizedElement>
          </LocalizedElement>
          <aside className="emi-results">
            <LocalizedElement as="div" className="emi-result-heading">
              <LocalizedElement as="p">YOUR ESTIMATE</LocalizedElement>
              <LocalizedElement as="span">{years * 12} monthly payments</LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="small">Estimated monthly EMI</LocalizedElement>
            <LocalizedElement as="h2">{money(result.emi)}</LocalizedElement>
            <LocalizedElement as="div" className="emi-payment-bar" aria-label={`${loanShare}% principal and ${100 - loanShare}% interest`}>
              <i style={{ width: `${loanShare}%` }} />
            </LocalizedElement>
            <LocalizedElement as="div" className="emi-legend">
              <LocalizedElement as="span"><i />Principal</LocalizedElement>
              <LocalizedElement as="span"><i />Interest</LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="div" className="emi-result-grid">
              <LocalizedElement as="span">Loan amount<LocalizedElement as="strong">{money(result.principal)}</LocalizedElement></LocalizedElement>
              <LocalizedElement as="span">Total interest<LocalizedElement as="strong">{money(result.interest)}</LocalizedElement></LocalizedElement>
              <LocalizedElement as="span">Total payable<LocalizedElement as="strong">{money(result.total)}</LocalizedElement></LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="div" className="emi-disclaimer">
              Indicative calculation only. Your lender determines the final rate, fees and eligibility.
            </LocalizedElement>
          </aside>
        </section>
        <section className="emi-enquiry">
          <LocalizedElement as="div" className="emi-enquiry-intro">
            <LocalizedElement as="p">NEXT STEP</LocalizedElement>
            <LocalizedElement as="h2">Want help with your shortlist?</LocalizedElement>
            <LocalizedElement as="span">Share your details and the RJ Tractor Techs team can help you continue your research.</LocalizedElement>
          </LocalizedElement>
          <LeadForm source="emi_calculator" />
        </section>
      </main>
    </PublicShell>
  );
}
