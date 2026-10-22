"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { contrast, mix, parseColor, toCmyk, toHex, toHsl, toHsv, type Rgba } from "./color";

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };
const STEPS = [0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="w-16 shrink-0 text-sm font-semibold">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-muted">{value}</code>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
      >
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

type BadgeProps = { ratio: number; label: string; background: string; foreground: string };

function ContrastBadge({ ratio, label, background, foreground }: BadgeProps) {
  const levels = [
    { name: "AA", pass: ratio >= 4.5 },
    { name: "AAA", pass: ratio >= 7 },
    { name: "AA Large", pass: ratio >= 3 },
  ];
  return (
    <div className="card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{ratio.toFixed(2)}:1</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {levels.map((l) => (
          <span
            key={l.name}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              l.pass ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            {l.pass ? "✓" : "✗"} {l.name}
          </span>
        ))}
      </div>
      <p className="mt-3 rounded-md border border-line px-3 py-2 text-sm font-medium" style={{ background, color: foreground }}>
        Sample text
      </p>
    </div>
  );
}

export default function ColorConverter() {
  const [input, setInput] = useState("#5b4cf0");
  const [color, setColor] = useState<Rgba>(() => parseColor("#5b4cf0")!);

  const invalid = input.trim() !== "" && parseColor(input) === null;

  function setFromInput(value: string) {
    setInput(value);
    const parsed = parseColor(value);
    if (parsed) setColor(parsed);
  }

  function setFromColor(c: Rgba) {
    setColor(c);
    setInput(toHex(c));
  }

  const hex = toHex(color);
  const solidHex = toHex({ ...color, a: 1 });
  const { r, g, b, a } = color;
  const hsl = toHsl(color);
  const hsv = toHsv(color);
  const cmyk = toCmyk(color);

  const rows = [
    { label: "HEX", value: hex },
    { label: "RGB", value: a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})` },
    { label: "HSL", value: a < 1 ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})` : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "HSV", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    { label: "CSS", value: `--color-brand: ${hex};` },
  ];

  return (
    <div className="space-y-5">
      <div className="card grid gap-5 p-5 sm:grid-cols-[180px_1fr]">
        <div
          className="aspect-square w-full rounded-2xl border border-line"
          style={{ background: `rgba(${r}, ${g}, ${b}, ${a})` }}
          aria-label={`Color swatch ${hex}`}
          role="img"
        />
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="cc-input">Color value</label>
            <div className="flex gap-2">
              <input
                id="cc-input"
                value={input}
                onChange={(e) => setFromInput(e.target.value)}
                placeholder="#5b4cf0, rgb(91, 76, 240) or hsl(245, 85%, 62%)"
                className={`field font-mono ${invalid ? "border-danger" : ""}`}
                spellCheck={false}
              />
              <input
                type="color"
                aria-label="Pick a color"
                value={solidHex}
                onChange={(e) => setFromColor({ ...parseColor(e.target.value)!, a: color.a })}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-line bg-surface"
              />
            </div>
            {invalid && <p className="mt-1.5 text-sm text-danger">Not a recognised color — try #ff6600 or rgb(255, 102, 0).</p>}
          </div>
          <div>
            <p className="label">Tints &amp; shades</p>
            <div className="flex overflow-hidden rounded-lg border border-line">
              {STEPS.map((step) => {
                const c = mix({ ...color, a: 1 }, step);
                const h = toHex(c);
                return (
                  <button
                    key={step}
                    type="button"
                    title={h}
                    aria-label={`Use ${h}`}
                    onClick={() => setFromColor(c)}
                    className={`h-10 flex-1 transition hover:scale-y-110 ${step === 0 ? "ring-2 ring-inset ring-foreground/40" : ""}`}
                    style={{ background: h }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card divide-y divide-line">
        {rows.map((row) => (
          <CopyRow key={row.label} {...row} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ContrastBadge ratio={contrast(color, WHITE)} label="Contrast on white" background="#ffffff" foreground={solidHex} />
        <ContrastBadge ratio={contrast(color, BLACK)} label="Contrast on black" background="#000000" foreground={solidHex} />
      </div>
      {a < 1 && <p className="text-xs text-muted">Contrast is calculated for the solid color; transparency is ignored.</p>}
    </div>
  );
}
