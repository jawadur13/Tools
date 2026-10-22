export type MonthRow = { month: number; payment: number; principal: number; interest: number; balance: number };
export type YearRow = { year: number; principal: number; interest: number; balance: number; months: MonthRow[] };

/**
 * Monthly instalment: P·r·(1+r)^n / ((1+r)^n − 1), with r the monthly rate.
 * At 0% interest it is simply P / n.
 */
export function emi(principal: number, annualRatePct: number, months: number): number {
  if (!(principal > 0) || !(months > 0) || !(annualRatePct >= 0)) return NaN;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** Month-by-month amortization. The final payment absorbs floating-point drift. */
export function schedule(principal: number, annualRatePct: number, months: number): MonthRow[] {
  const payment = emi(principal, annualRatePct, months);
  if (!Number.isFinite(payment)) return [];
  const r = annualRatePct / 12 / 100;
  const rows: MonthRow[] = [];
  let balance = principal;
  for (let month = 1; month <= months; month++) {
    const interest = balance * r;
    let principalPart = payment - interest;
    if (month === months) principalPart = balance;
    balance = Math.max(0, balance - principalPart);
    rows.push({ month, payment: principalPart + interest, principal: principalPart, interest, balance });
  }
  return rows;
}

export function yearly(rows: MonthRow[]): YearRow[] {
  const years: YearRow[] = [];
  for (const row of rows) {
    const index = Math.ceil(row.month / 12) - 1;
    const y = (years[index] ??= { year: index + 1, principal: 0, interest: 0, balance: 0, months: [] });
    y.principal += row.principal;
    y.interest += row.interest;
    y.balance = row.balance;
    y.months.push(row);
  }
  return years;
}
