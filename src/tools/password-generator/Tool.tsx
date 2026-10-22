"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

type Options = {
  length: number;
  count: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
};

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?~",
} as const;
const AMBIGUOUS = /[Il1O0o|`'"]/g;

/** Uniform integer in [0, max) using rejection sampling, so there is no modulo bias. */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

function activeSets(o: Options): string[] {
  return (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => o[k])
    .map((k) => (o.noAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
}

function generateOne(o: Options): string {
  const sets = activeSets(o);
  const pool = sets.join("");
  // One character from each chosen set guarantees every type appears.
  const chars = sets.map((s) => s[randomInt(s.length)]);
  while (chars.length < o.length) chars.push(pool[randomInt(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, o.length).join("");
}

function generate(o: Options): string[] {
  if (activeSets(o).length === 0) return [];
  return Array.from({ length: o.count }, () => generateOne(o));
}

function strength(o: Options) {
  const pool = activeSets(o).join("").length;
  const bits = pool > 1 ? Math.round(o.length * Math.log2(pool)) : 0;
  if (bits < 40) return { bits, label: "Weak", color: "bg-danger", width: "25%" };
  if (bits < 60) return { bits, label: "Fair", color: "bg-amber-500", width: "50%" };
  if (bits < 80) return { bits, label: "Strong", color: "bg-success", width: "75%" };
  return { bits, label: "Very strong", color: "bg-success", width: "100%" };
}

const DEFAULTS: Options = { length: 16, count: 5, upper: true, lower: true, digits: true, symbols: true, noAmbiguous: false };

export default function PasswordGenerator() {
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [passwords, setPasswords] = useState<string[]>(() => generate(DEFAULTS));
  const [copied, setCopied] = useState<number | null>(null);

  function update(patch: Partial<Options>) {
    const next = { ...options, ...patch };
    setOptions(next);
    setPasswords(generate(next));
    setCopied(null);
  }

  async function copy(i: number) {
    await navigator.clipboard.writeText(passwords[i]);
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500);
  }

  const s = strength(options);
  const noneSelected = activeSets(options).length === 0;
  const toggles: { key: keyof typeof SETS; label: string; sample: string }[] = [
    { key: "upper", label: "Uppercase", sample: "A–Z" },
    { key: "lower", label: "Lowercase", sample: "a–z" },
    { key: "digits", label: "Numbers", sample: "0–9" },
    { key: "symbols", label: "Symbols", sample: "!@#$" },
  ];

  return (
    <div className="card space-y-6 p-5 sm:p-8">
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="pw-length">Length</label>
          <span className="text-2xl font-bold tabular-nums">{options.length}</span>
        </div>
        <input
          id="pw-length"
          type="range"
          min={4}
          max={128}
          value={options.length}
          onChange={(e) => update({ length: Number(e.target.value) })}
          className="w-full accent-accent"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {toggles.map((t) => (
          <label
            key={t.key}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
              options[t.key] ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"
            }`}
          >
            <input type="checkbox" checked={options[t.key]} onChange={(e) => update({ [t.key]: e.target.checked })} />
            <span>
              <span className="block font-medium">{t.label}</span>
              <span className="font-mono text-xs text-muted">{t.sample}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={options.noAmbiguous} onChange={(e) => update({ noAmbiguous: e.target.checked })} />
          Exclude look-alike characters (I l 1 O 0)
        </label>
        <label className="flex items-center gap-2 text-sm">
          How many
          <select className="field w-20" value={options.count} onChange={(e) => update({ count: Number(e.target.value) })}>
            {[1, 5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm">
          <span>
            Strength: <span className="font-semibold">{noneSelected ? "—" : s.label}</span>
          </span>
          <span className="text-muted">{noneSelected ? 0 : s.bits} bits of entropy</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className={`h-full rounded-full transition-all ${s.color}`} style={{ width: noneSelected ? 0 : s.width }} />
        </div>
      </div>

      {noneSelected ? (
        <p className="text-sm text-danger">Select at least one character type.</p>
      ) : (
        <ul className="space-y-2">
          {passwords.map((pw, i) => (
            <li key={i} className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 p-2 pl-4">
              <code className="min-w-0 flex-1 break-all font-mono text-[15px]">{pw}</code>
              <button
                type="button"
                onClick={() => copy(i)}
                aria-label="Copy password"
                className="btn-secondary shrink-0 px-3 py-2"
              >
                {copied === i ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn-primary w-full" disabled={noneSelected} onClick={() => update({})}>
        <RefreshCw className="size-4" /> Generate new passwords
      </button>
    </div>
  );
}
