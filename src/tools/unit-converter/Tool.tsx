"use client";

import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { categories, convert, formatNumber } from "./units";

// Sensible starting pair for each category.
const defaults: Record<string, [string, string]> = {
  length: ["cm", "in"],
  weight: ["kg", "lb"],
  temperature: ["c", "f"],
  area: ["katha", "ft2"],
  volume: ["l", "gal"],
  speed: ["kmh", "mph"],
  time: ["h", "min"],
  data: ["GB", "GiB"],
};

export default function UnitConverter() {
  const [categoryId, setCategoryId] = useState("length");
  const [value, setValue] = useState("1");
  const [fromId, setFromId] = useState(defaults.length[0]);
  const [toId, setToId] = useState(defaults.length[1]);

  const category = categories.find((c) => c.id === categoryId)!;
  const from = category.units.find((u) => u.id === fromId) ?? category.units[0];
  const to = category.units.find((u) => u.id === toId) ?? category.units[1];
  const n = value.trim() === "" ? NaN : Number(value);
  const result = Number.isFinite(n) ? convert(n, from, to) : NaN;

  function pickCategory(id: string) {
    setCategoryId(id);
    setFromId(defaults[id][0]);
    setToId(defaults[id][1]);
  }

  function swap() {
    setFromId(to.id);
    setToId(from.id);
    if (Number.isFinite(result)) setValue(String(Number(result.toPrecision(12))));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pickCategory(c.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              c.id === categoryId ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-2">
            <label className="label" htmlFor="uc-value">
              From
            </label>
            <input
              id="uc-value"
              type="number"
              inputMode="decimal"
              className="field text-lg tabular-nums"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <select aria-label="From unit" className="field" value={from.id} onChange={(e) => setFromId(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          <button type="button" onClick={swap} aria-label="Swap units" className="btn-secondary mx-auto mb-0.5 size-11 rounded-full p-0">
            <ArrowLeftRight className="size-4" />
          </button>

          <div className="space-y-2">
            <p className="label">To</p>
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-lg font-semibold tabular-nums">{formatNumber(result)}</span>
              <CopyButton text={Number.isFinite(result) ? String(Number(result.toPrecision(12))) : ""} label="Copy result" iconOnly />
            </div>
            <select aria-label="To unit" className="field" value={to.id} onChange={(e) => setToId(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {Number.isFinite(result) && (
          <p className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-center font-medium text-accent">
            {formatNumber(n)} {from.symbol} = {formatNumber(result)} {to.symbol}
          </p>
        )}
      </div>

      {Number.isFinite(n) && (
        <div className="card overflow-hidden">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">
            {formatNumber(n)} {from.name.toLowerCase()} in every {category.name.toLowerCase()} unit
          </p>
          <ul className="grid sm:grid-cols-2">
            {category.units
              .filter((u) => u.id !== from.id)
              .map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setToId(u.id)}
                    className={`flex w-full items-baseline justify-between gap-3 border-b border-line px-4 py-2.5 text-left text-sm hover:bg-surface-2 ${
                      u.id === to.id ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span className="text-muted">{u.name}</span>
                    <span className="font-medium tabular-nums">
                      {formatNumber(convert(n, from, u))} <span className="text-muted">{u.symbol}</span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
