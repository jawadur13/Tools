"use client";

import { ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { emi, schedule, yearly } from "./emi";

const currencies = [
  { code: "BDT", locale: "en-BD", symbol: "৳" },
  { code: "USD", locale: "en-US", symbol: "$" },
  { code: "INR", locale: "en-IN", symbol: "₹" },
  { code: "EUR", locale: "de-DE", symbol: "€" },
  { code: "GBP", locale: "en-GB", symbol: "£" },
];

const MAX_MONTHS = 600;

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

export default function LoanEmiCalculator() {
  const [amount, setAmount] = useState("1000000");
  const [rate, setRate] = useState("9");
  const [tenure, setTenure] = useState("5");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [currency, setCurrency] = useState("BDT");
  const [openYear, setOpenYear] = useState<number | null>(null);

  const cur = currencies.find((c) => c.code === currency)!;
  const fmt = new Intl.NumberFormat(cur.locale, { style: "currency", currency: cur.code, maximumFractionDigits: 0 });

  const principal = num(amount);
  const months = Math.round(tenureUnit === "years" ? num(tenure) * 12 : num(tenure));
  const annualRate = num(rate);
  const monthly = emi(principal, annualRate, months);
  // 50 years is the longest realistic loan and keeps the schedule table small.
  const tooLong = months > MAX_MONTHS;
  const valid = Number.isFinite(monthly) && !tooLong;
  const rows = valid ? schedule(principal, annualRate, months) : [];
  const years = yearly(rows);

  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
  const totalInterest = totalPaid - (valid ? principal : 0);
  const principalShare = valid && totalPaid > 0 ? (principal / totalPaid) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="card grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <label className="label" htmlFor="emi-amount">
            Loan amount
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Currency"
              className="field w-24"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <input
              id="emi-amount"
              type="number"
              inputMode="decimal"
              min={0}
              className="field tabular-nums"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="emi-rate">
            Interest rate (% per year)
          </label>
          <input
            id="emi-rate"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            className="field tabular-nums"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="emi-tenure">
            Loan tenure
          </label>
          <div className="flex gap-2">
            <input
              id="emi-tenure"
              type="number"
              inputMode="numeric"
              min={1}
              className="field tabular-nums"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
            />
            <div className="flex shrink-0 rounded-lg bg-surface-2 p-1 text-sm">
              {(["years", "months"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setTenureUnit(u)}
                  className={`rounded-md px-3 py-1 font-medium capitalize transition ${tenureUnit === u ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {valid ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card bg-accent-soft p-5">
              <p className="text-sm text-muted">Monthly EMI</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-accent">{fmt.format(monthly)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-muted">Total interest</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(totalInterest)}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-muted">Total payment</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{fmt.format(totalPaid)}</p>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-amber-400">
              <span className="bg-accent" style={{ width: `${principalShare}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-accent" /> Principal {principalShare.toFixed(1)}%
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-400" /> Interest {(100 - principalShare).toFixed(1)}%
              </span>
              <span className="text-muted">
                {months} monthly payment{months === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="card overflow-hidden">
            <p className="border-b border-line px-4 py-3 font-semibold">Repayment schedule</p>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm tabular-nums">
                <thead className="bg-surface-2 text-xs text-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Year</th>
                    <th className="px-4 py-2 font-medium">Principal</th>
                    <th className="px-4 py-2 font-medium">Interest</th>
                    <th className="px-4 py-2 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => (
                    <Fragment key={y.year}>
                      <tr className="border-t border-line">
                        <td className="px-4 py-2 text-left">
                          <button
                            type="button"
                            onClick={() => setOpenYear(openYear === y.year ? null : y.year)}
                            aria-expanded={openYear === y.year}
                            className="flex items-center gap-1 font-medium hover:text-accent"
                          >
                            <ChevronRight className={`size-4 transition ${openYear === y.year ? "rotate-90" : ""}`} />
                            Year {y.year}
                          </button>
                        </td>
                        <td className="px-4 py-2">{fmt.format(y.principal)}</td>
                        <td className="px-4 py-2">{fmt.format(y.interest)}</td>
                        <td className="px-4 py-2">{fmt.format(y.balance)}</td>
                      </tr>
                      {openYear === y.year &&
                        y.months.map((m) => (
                          <tr key={m.month} className="bg-surface-2/60 text-xs text-muted">
                            <td className="py-1.5 pl-11 pr-4 text-left">Month {m.month}</td>
                            <td className="px-4 py-1.5">{fmt.format(m.principal)}</td>
                            <td className="px-4 py-1.5">{fmt.format(m.interest)}</td>
                            <td className="px-4 py-1.5">{fmt.format(m.balance)}</td>
                          </tr>
                        ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="card p-5 text-sm text-muted">
          {tooLong ? "Tenure can be at most 50 years (600 months)." : "Enter a loan amount, interest rate and tenure to see your EMI."}
        </p>
      )}
    </div>
  );
}
