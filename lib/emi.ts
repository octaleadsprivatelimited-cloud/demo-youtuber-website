export function calculateEmi(price: number, down: number, annualRate: number, months: number) {
  if (![price, down, annualRate, months].every(Number.isFinite) || price <= 0 || down < 0 || down > price || annualRate < 0 || annualRate > 100 || !Number.isInteger(months) || months < 1 || months > 360) return null;
  const principal = price - down;
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
  const total = emi * months;
  return { principal, emi, total, interest: Math.max(0, total - principal) };
}
