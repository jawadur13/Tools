/** sRGB color, channels 0–255, alpha 0–1. */
export type Rgba = { r: number; g: number; b: number; a: number };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, digits = 0) => Number(n.toFixed(digits));

export function parseColor(input: string): Rgba | null {
  const s = input.trim().toLowerCase();

  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? round(n(6) / 255, 3) : 1 };
  }

  const fn = /^(rgba?|hsla?)\(\s*([^)]*)\)$/.exec(s);
  if (!fn) return null;
  const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3 || parts.length > 4) return null;
  const alpha = parts[3] === undefined ? 1 : parseAlpha(parts[3]);
  if (alpha === null) return null;

  if (fn[1].startsWith("rgb")) {
    const channels = parts.slice(0, 3).map((p) => (p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p)));
    if (channels.some((c) => Number.isNaN(c))) return null;
    const [r, g, b] = channels.map((c) => clamp(Math.round(c), 0, 255));
    return { r, g, b, a: alpha };
  }

  const h = parseFloat(parts[0]);
  const sat = parseFloat(parts[1]);
  const light = parseFloat(parts[2]);
  if ([h, sat, light].some((n) => Number.isNaN(n))) return null;
  return { ...hslToRgb(h, clamp(sat, 0, 100), clamp(light, 0, 100)), a: alpha };
}

function parseAlpha(p: string): number | null {
  const n = p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p);
  return Number.isNaN(n) ? null : clamp(n, 0, 1);
}

export function hslToRgb(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

export function toHsl({ r, g, b }: Rgba) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
  }
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round((h * 60 + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function toHsv({ r, g, b }: Rgba) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  return { h: toHsl({ r, g, b, a: 1 }).h, s: Math.round(max === 0 ? 0 : (d / max) * 100), v: Math.round(max * 100) };
}

export function toCmyk({ r, g, b }: Rgba) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const part = (v: number) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100);
  return { c: part(r), m: part(g), y: part(b), k: Math.round(k * 100) };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex({ r, g, b, a }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;
}

/** Mix toward white (amount > 0) or black (amount < 0), -1…1. */
export function mix(color: Rgba, amount: number): Rgba {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const ch = (v: number) => Math.round(v + (target - v) * t);
  return { r: ch(color.r), g: ch(color.g), b: ch(color.b), a: color.a };
}

function luminance({ r, g, b }: Rgba): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return round((hi + 0.05) / (lo + 0.05), 2);
}
