"use client";

import { useState } from "react";
import { bmi, category, feetInchesToCm, healthyRange, KG_PER_LB, scalePosition, type BmiCategory } from "./bmi";

type System = "metric" | "imperial";

const toneText: Record<BmiCategory["tone"], string> = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-success",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-danger",
};

// Display scale runs from 15 to 40.
const segments = [
  { label: "Under", from: 15, to: 18.5, color: "bg-sky-400" },
  { label: "Normal", from: 18.5, to: 25, color: "bg-emerald-500" },
  { label: "Over", from: 25, to: 30, color: "bg-amber-400" },
  { label: "Obese", from: 30, to: 40, color: "bg-red-500" },
];

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

function Field({ id, label, unit, value, onChange }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          className="field pr-12 tabular-nums"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">{unit}</span>
      </div>
    </div>
  );
}

export default function BmiCalculator() {
  const [system, setSystem] = useState<System>("metric");
  const [cm, setCm] = useState("170");
  const [kg, setKg] = useState("68");
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("7");
  const [lb, setLb] = useState("150");

  const heightCm = system === "metric" ? num(cm) : feetInchesToCm(num(ft) || 0, num(inch) || 0);
  const weightKg = system === "metric" ? num(kg) : num(lb) * KG_PER_LB;
  const value = bmi(weightKg, heightCm);
  const cat = value !== null ? category(value) : null;
  const range = heightCm > 0 ? healthyRange(heightCm) : null;

  const formatWeight = (k: number) =>
    system === "metric" ? `${k.toFixed(1)} kg` : `${(k / KG_PER_LB).toFixed(1)} lb`;

  return (
    <div className="card grid gap-8 p-5 sm:p-8 md:grid-cols-2">
      <div className="space-y-5">
        <div className="flex rounded-lg bg-surface-2 p-1 text-sm">
          {(
            [
              ["metric", "Metric (cm, kg)"],
              ["imperial", "Imperial (ft, lb)"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSystem(id)}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${system === id ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {system === "metric" ? (
          <>
            <Field id="bmi-cm" label="Height" unit="cm" value={cm} onChange={setCm} />
            <Field id="bmi-kg" label="Weight" unit="kg" value={kg} onChange={setKg} />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field id="bmi-ft" label="Height (feet)" unit="ft" value={ft} onChange={setFt} />
              <Field id="bmi-in" label="Inches" unit="in" value={inch} onChange={setInch} />
            </div>
            <Field id="bmi-lb" label="Weight" unit="lb" value={lb} onChange={setLb} />
          </>
        )}
      </div>

      <div className="flex flex-col justify-center rounded-2xl bg-surface-2 p-6">
        {value !== null && cat ? (
          <>
            <p className="text-sm text-muted">Your BMI</p>
            <p className="mt-1 text-5xl font-bold tabular-nums">{value.toFixed(1)}</p>
            <p className={`mt-1 text-lg font-semibold ${toneText[cat.tone]}`}>{cat.label}</p>

            <div className="relative mt-6 pt-4">
              <span
                className="absolute top-0 -translate-x-1/2 text-xs font-bold"
                style={{ left: `${scalePosition(value)}%` }}
                aria-hidden
              >
                ▼
              </span>
              <div className="flex h-3 overflow-hidden rounded-full">
                {segments.map((s) => (
                  <span key={s.label} className={s.color} style={{ width: `${((s.to - s.from) / 25) * 100}%` }} />
                ))}
              </div>
              <div className="relative mt-1 h-4 text-[10px] text-muted">
                {[18.5, 25, 30].map((v) => (
                  <span key={v} className="absolute -translate-x-1/2" style={{ left: `${scalePosition(v)}%` }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {range && (
              <p className="mt-4 text-sm text-muted">
                Healthy weight for your height:{" "}
                <span className="font-semibold text-foreground">
                  {formatWeight(range[0])} – {formatWeight(range[1])}
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-sm text-muted">Enter your height and weight to see your BMI.</p>
        )}
      </div>
    </div>
  );
}
