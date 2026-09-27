export function calculateEmi(price: number, down: number, annualRate: number, months: number) {
  if (![price, down, annualRate, months].every(Number.isFinite) || price <= 0 || down < 0 || down > price || annualRate < 0 || annualRate > 100 || !Number.isInteger(months) || months < 1 || months > 360) return null;
  const principal = price - down;
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
  const total = emi * months;
  return { principal, emi, total, interest: Math.max(0, total - principal) };
}

export function emiSchedule(principal: number, annualRate: number, months: number) {
  const result = calculateEmi(principal, 0, annualRate, months);
  if (!result) return [];
  const rows: { month: number; principal: number; interest: number; balance: number }[] = [];
  let balance = principal, paidPrincipal = 0, paidInterest = 0;
  for (let month = 1; month <= months; month++) {
    const interest = balance * annualRate / 1200;
    const payment = Math.min(balance, Math.max(0, result.emi - interest));
    balance = Math.max(0, balance - payment);
    paidPrincipal += payment; paidInterest += interest;
    if (month % 12 === 0 || month === months) {
      rows.push({month, principal: paidPrincipal, interest: paidInterest, balance: month === months ? 0 : balance});
      paidPrincipal = 0; paidInterest = 0;
    }
  }
  return rows;
}
