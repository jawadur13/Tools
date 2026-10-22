"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FileDrop } from "@/components/FileDrop";

type RGB = [number, number, number];
type Source = { name: string; bitmap: ImageBitmap; palette: RGB[] };

const LOUPE_PIXELS = 11; // odd, so the picked pixel sits in the middle
const LOUPE_SIZE = 110;
const HISTORY = 12;

const toHex = ([r, g, b]: RGB) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const toRgb = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

function toHsl([r, g, b]: RGB) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

const luminance = ([r, g, b]: RGB) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Dominant colors via k-means on a downsampled copy, biggest cluster first. */
function extractPalette(bitmap: ImageBitmap, k = 6): RGB[] {
  const scale = Math.min(1, 100 / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const pixels: RGB[] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent pixels
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length === 0) return [];

  // Deterministic start: centers spread across the brightness range.
  const sorted = [...pixels].sort((a, b) => luminance(a) - luminance(b));
  const n = Math.min(k, pixels.length);
  let centers: RGB[] = Array.from({ length: n }, (_, i) => sorted[Math.floor(((i + 0.5) / n) * sorted.length)]);
  let counts: number[] = [];

  for (let iter = 0; iter < 12; iter++) {
    const sums = centers.map(() => [0, 0, 0]);
    counts = centers.map(() => 0);
    for (const p of pixels) {
      let best = 0;
      let bestDist = Infinity;
      centers.forEach((c, j) => {
        const dist = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          best = j;
        }
      });
      sums[best][0] += p[0];
      sums[best][1] += p[1];
      sums[best][2] += p[2];
      counts[best]++;
    }
    centers = centers.map((c, j) =>
      counts[j] ? (sums[j].map((s) => Math.round(s / counts[j])) as RGB) : c,
    );
  }

  return centers
    .map((c, j) => ({ c, count: counts[j] }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((x) => x.c);
}

export default function ImageColorPicker() {
  const [source, setSource] = useState<Source | null>(null);
  const [picked, setPicked] = useState<RGB | null>(null);
  const [hover, setHover] = useState<RGB | null>(null);
  const [history, setHistory] = useState<RGB[]>([]);
  const [error, setError] = useState("");
  const display = useRef<HTMLCanvasElement>(null);
  const loupe = useRef<HTMLCanvasElement>(null);
  const pixels = useRef<CanvasRenderingContext2D | null>(null);

  async function load(files: File[]) {
    setError("");
    try {
      const bitmap = await createImageBitmap(files[0]);
      // Full-resolution copy we read exact pixel values from.
      const full = document.createElement("canvas");
      full.width = bitmap.width;
      full.height = bitmap.height;
      const ctx = full.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(bitmap, 0, 0);
      pixels.current = ctx;
      source?.bitmap.close();
      setSource({ name: files[0].name, bitmap, palette: extractPalette(bitmap) });
      setPicked(null);
      setHover(null);
    } catch {
      setError("This image could not be opened. Try a JPG, PNG or WebP file.");
    }
  }

  useEffect(() => {
    const canvas = display.current;
    if (!canvas || !source) return;
    canvas.width = source.bitmap.width;
    canvas.height = source.bitmap.height;
    canvas.getContext("2d")!.drawImage(source.bitmap, 0, 0);
  }, [source]);

  /** Source-pixel coordinates under the pointer. */
  function locate(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!source) return null;
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - box.left) / box.width) * source.bitmap.width);
    const y = Math.floor(((e.clientY - box.top) / box.height) * source.bitmap.height);
    if (x < 0 || y < 0 || x >= source.bitmap.width || y >= source.bitmap.height) return null;
    return { x, y };
  }

  function colorAt(x: number, y: number): RGB {
    const [r, g, b] = pixels.current!.getImageData(x, y, 1, 1).data;
    return [r, g, b];
  }

  function onMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const at = locate(e);
    if (!at) return;
    setHover(colorAt(at.x, at.y));
    const canvas = loupe.current;
    if (!canvas || !pixels.current) return;
    const ctx = canvas.getContext("2d")!;
    const half = Math.floor(LOUPE_PIXELS / 2);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    ctx.drawImage(pixels.current.canvas, at.x - half, at.y - half, LOUPE_PIXELS, LOUPE_PIXELS, 0, 0, LOUPE_SIZE, LOUPE_SIZE);
    const cell = LOUPE_SIZE / LOUPE_PIXELS;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(half * cell, half * cell, cell, cell);
  }

  function pick(color: RGB) {
    setPicked(color);
    setHistory((prev) => [color, ...prev.filter((c) => toHex(c) !== toHex(color))].slice(0, HISTORY));
  }

  function onClick(e: ReactPointerEvent<HTMLCanvasElement>) {
    const at = locate(e);
    if (at) pick(colorAt(at.x, at.y));
  }

  if (!source) {
    return (
      <div className="space-y-3">
        <FileDrop accept="image/jpeg,image/png,image/webp,image/gif,image/bmp" multiple={false} label="Drop an image here or click to choose" hint="JPG, PNG, WebP, GIF or BMP" onFiles={load} />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const shown = picked ?? hover;
  const rows = shown
    ? [
        { label: "HEX", value: toHex(shown) },
        { label: "RGB", value: toRgb(shown) },
        { label: "HSL", value: toHsl(shown) },
      ]
    : [];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="card p-3">
          <div className="flex justify-center rounded-xl bg-surface-2 p-2">
            <canvas
              ref={display}
              onPointerMove={onMove}
              onPointerDown={onClick}
              className="max-h-[65vh] max-w-full cursor-crosshair touch-none"
              aria-label={`Click to pick a color from ${source.name}`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card flex items-center gap-4 p-4">
            <canvas
              ref={loupe}
              width={LOUPE_SIZE}
              height={LOUPE_SIZE}
              className="size-[110px] rounded-full border-4 border-surface-2 bg-surface-2 shadow"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs text-muted">Under cursor</p>
              <p className="font-mono text-sm">{hover ? toHex(hover) : "—"}</p>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <span
                className="size-12 shrink-0 rounded-xl border border-line"
                style={{ background: shown ? toHex(shown) : "transparent" }}
              />
              <p className="text-sm font-semibold">{picked ? "Picked color" : "Click the image to pick"}</p>
            </div>
            {rows.length > 0 && (
              <ul className="mt-3 divide-y divide-line">
                {rows.map((r) => (
                  <li key={r.label} className="flex items-center gap-3 py-1.5">
                    <span className="w-10 text-xs font-semibold text-muted">{r.label}</span>
                    <span className="flex-1 font-mono text-sm">{r.value}</span>
                    <CopyButton text={r.value} label={`Copy ${r.label}`} iconOnly />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {source.palette.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold">Dominant colors</p>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {source.palette.map((c, i) => (
              <button key={`${toHex(c)}-${i}`} type="button" onClick={() => pick(c)} className="group text-left">
                <span className="block h-16 rounded-xl border border-line transition group-hover:scale-105" style={{ background: toHex(c) }} />
                <span className="mt-1.5 block font-mono text-xs text-muted group-hover:text-foreground">{toHex(c)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold">Recent picks</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {history.map((c) => (
              <button
                key={toHex(c)}
                type="button"
                onClick={() => setPicked(c)}
                className="flex items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pl-1 pr-3 text-xs font-mono hover:border-accent"
              >
                <span className="size-5 rounded-full border border-line" style={{ background: toHex(c) }} />
                {toHex(c)}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn-secondary"
        onClick={() => {
          source.bitmap.close();
          setSource(null);
          setHistory([]);
        }}
      >
        <ImagePlus className="size-4" /> Choose another image
      </button>
    </div>
  );
}
