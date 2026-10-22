"use client";

import { useState, type ReactNode } from "react";

/** Up to 4 decimals, trailing zeros dropped, with thousands separators. */
function format(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function NumberInput({ value, onChange, label, suffix }: { value: string; onChange: (v: string) => void; label: string; suffix?: string }) {
  return (
    <span className="relative inline-block w-28">
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`field text-center tabular-nums ${suffix ? "pr-7" : ""}`}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
    </span>
  );
}

function Calculator({ title, children, result, formula }: { title: string; children: ReactNode; result: string | null; formula?: string }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">{children}</div>
      <div className="mt-4 rounded-xl bg-surface-2 px-4 py-3">
        <p className="text-2xl font-bold tabular-nums">{result ?? "—"}</p>
        {result && formula && <p className="mt-0.5 text-xs text-muted">{formula}</p>}
      </div>
    </div>
  );
}

export default function PercentageCalculator() {
  const [a1, setA1] = useState("20");
  const [a2, setA2] = useState("150");
  const [b1, setB1] = useState("30");
  const [b2, setB2] = useState("150");
  const [c1, setC1] = useState("80");
  const [c2, setC2] = useState("100");
  const [d1, setD1] = useState("15");
  const [d2, setD2] = useState("2000");
  const [dMode, setDMode] = useState<"add" | "subtract">("subtract");

  // 1. What is X% of Y
  const [p, y] = [num(a1), num(a2)];
  const r1 = Number.isFinite(p) && Number.isFinite(y) ? (p / 100) * y : null;

  // 2. X is what % of Y
  const [x2, y2] = [num(b1), num(b2)];
  const r2 = Number.isFinite(x2) && Number.isFinite(y2) && y2 !== 0 ? (x2 / y2) * 100 : null;

  // 3. % change from X to Y
  const [from, to] = [num(c1), num(c2)];
  const r3 = Number.isFinite(from) && Number.isFinite(to) && from !== 0 ? ((to - from) / Math.abs(from)) * 100 : null;

  // 4. Add/subtract X% to/from Y
  const [pct, base] = [num(d1), num(d2)];
  const r4 = Number.isFinite(pct) && Number.isFinite(base) ? base * (1 + ((dMode === "add" ? 1 : -1) * pct) / 100) : null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Calculator title="What is X% of Y?" result={r1 === null ? null : format(r1)} formula={`${a2} × ${a1} ÷ 100`}>
        What is <NumberInput value={a1} onChange={setA1} label="Percentage" suffix="%" /> of{" "}
        <NumberInput value={a2} onChange={setA2} label="Number" />?
      </Calculator>

      <Calculator
        title="X is what percent of Y?"
        result={r2 === null ? (y2 === 0 ? "Can't divide by 0" : null) : `${format(r2)}%`}
        formula={`${b1} ÷ ${b2} × 100`}
      >
        <NumberInput value={b1} onChange={setB1} label="Part" /> is what % of <NumberInput value={b2} onChange={setB2} label="Whole" />?
      </Calculator>

      <Calculator
        title="Percentage change"
        result={
          r3 === null
            ? from === 0
              ? "Can't change from 0"
              : null
            : r3 === 0
              ? "No change"
              : `${format(Math.abs(r3))}% ${r3 > 0 ? "increase" : "decrease"}`
        }
        formula={`(${c2} − ${c1}) ÷ |${c1}| × 100`}
      >
        From <NumberInput value={c1} onChange={setC1} label="Old value" /> to <NumberInput value={c2} onChange={setC2} label="New value" />
      </Calculator>

      <Calculator
        title="Add or subtract a percentage"
        result={r4 === null ? null : format(r4)}
        formula={`${d2} ${dMode === "add" ? "+" : "−"} ${d1}% = ${d2} × ${dMode === "add" ? `(1 + ${d1}/100)` : `(1 − ${d1}/100)`}`}
      >
        <select value={dMode} onChange={(e) => setDMode(e.target.value as "add" | "subtract")} className="field w-auto" aria-label="Add or subtract">
          <option value="subtract">Subtract</option>
          <option value="add">Add</option>
        </select>
        <NumberInput value={d1} onChange={setD1} label="Percentage" suffix="%" /> {dMode === "add" ? "to" : "from"}{" "}
        <NumberInput value={d2} onChange={setD2} label="Number" />
      </Calculator>
    </div>
  );
}
