"use client";

import { Download, FileText, Loader2, X } from "lucide-react";
import { degrees, PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Layout = "center" | "tile";
type Loaded = { file: File; pages: number };
type Style = { text: string; size: number; opacity: number; color: string; angle: number; layout: Layout };

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** Draws `text` so that its visual center lands on (cx, cy), rotated by `angle` degrees. */
function drawCentered(page: PDFPage, font: PDFFont, style: Style, cx: number, cy: number) {
  const w = font.widthOfTextAtSize(style.text, style.size);
  const h = font.heightAtSize(style.size, { descender: false });
  const rad = (style.angle * Math.PI) / 180;
  // pdf-lib rotates around the text's bottom-left origin, so shift the origin back
  // by the rotated half-size vector to keep the center fixed.
  const x = cx - ((w / 2) * Math.cos(rad) - (h / 2) * Math.sin(rad));
  const y = cy - ((w / 2) * Math.sin(rad) + (h / 2) * Math.cos(rad));
  page.drawText(style.text, {
    x,
    y,
    size: style.size,
    font,
    color: hexToRgb(style.color),
    opacity: style.opacity / 100,
    rotate: degrees(style.angle),
  });
}

function watermarkPage(page: PDFPage, font: PDFFont, style: Style) {
  const { x, y, width, height } = page.getCropBox();
  if (style.layout === "center") {
    drawCentered(page, font, style, x + width / 2, y + height / 2);
    return;
  }
  const stepX = font.widthOfTextAtSize(style.text, style.size) + style.size * 3;
  const stepY = style.size * 4;
  // Cover the page diagonal so rotated rows still reach every corner.
  const reach = Math.hypot(width, height);
  for (let row = -reach; row <= reach; row += stepY) {
    const offset = (Math.round(row / stepY) % 2) * (stepX / 2);
    for (let col = -reach; col <= reach; col += stepX) {
      drawCentered(page, font, style, x + width / 2 + col + offset, y + height / 2 + row);
    }
  }
}

export default function WatermarkPdf() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [style, setStyle] = useState<Style>({
    text: "CONFIDENTIAL",
    size: 60,
    opacity: 20,
    color: "#c4323b",
    angle: 45,
    layout: "center",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Style>(key: K, value: Style[K]) => setStyle((s) => ({ ...s, [key]: value }));

  async function addFile([file]: File[]) {
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      setLoaded({ file, pages: doc.getPageCount() });
    } catch {
      setError("Can't read this PDF. It may be damaged or password-protected.");
    }
  }

  async function run() {
    if (!loaded || !style.text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      try {
        font.encodeText(style.text);
      } catch {
        setError("The watermark can only use Latin letters, numbers and common symbols.");
        return;
      }
      doc.getPages().forEach((page) => watermarkPage(page, font, style));
      const bytes = await doc.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${baseName(loaded.file.name)}-watermarked.pdf`);
    } catch {
      setError("Something went wrong while adding the watermark.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        <FileDrop accept="application/pdf,.pdf" multiple={false} label="Drop a PDF here or click to choose" hint="One PDF file" onFiles={addFile} />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{loaded.file.name}</p>
          <p className="text-xs text-muted">
            {loaded.pages} page{loaded.pages === 1 ? "" : "s"} · {formatBytes(loaded.file.size)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Choose another PDF"
          onClick={() => setLoaded(null)}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="card grid gap-6 p-5 md:grid-cols-[1fr_200px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="wm-text">Watermark text</label>
            <input id="wm-text" className="field" value={style.text} maxLength={60} onChange={(e) => set("text", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="wm-size">Font size: {style.size}pt</label>
            <input
              id="wm-size"
              type="range"
              min={12}
              max={150}
              value={style.size}
              onChange={(e) => set("size", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="wm-opacity">Opacity: {style.opacity}%</label>
            <input
              id="wm-opacity"
              type="range"
              min={5}
              max={100}
              value={style.opacity}
              onChange={(e) => set("opacity", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="wm-angle">Angle: {style.angle}°</label>
            <input
              id="wm-angle"
              type="range"
              min={-90}
              max={90}
              step={5}
              value={style.angle}
              onChange={(e) => set("angle", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="label" htmlFor="wm-color">Color</label>
              <input
                id="wm-color"
                type="color"
                value={style.color}
                onChange={(e) => set("color", e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface"
              />
            </div>
            <div className="flex-1">
              <label className="label" htmlFor="wm-layout">Layout</label>
              <select id="wm-layout" className="field" value={style.layout} onChange={(e) => set("layout", e.target.value as Layout)}>
                <option value="center">Centered</option>
                <option value="tile">Tiled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rough live preview on an A4-shaped sheet. */}
        <div className="relative mx-auto aspect-[210/297] w-full max-w-[200px] overflow-hidden rounded-md border border-line bg-white shadow-sm">
          <div className="absolute inset-x-4 top-4 space-y-1.5">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="h-1.5 rounded bg-neutral-200" style={{ width: `${90 - ((i * 17) % 35)}%` }} />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-wrap content-center items-center justify-center gap-x-6 gap-y-4">
            {Array.from({ length: style.layout === "tile" ? 12 : 1 }, (_, i) => (
              <span
                key={i}
                className="whitespace-nowrap font-bold"
                style={{
                  color: style.color,
                  opacity: style.opacity / 100,
                  fontSize: `${Math.max(6, style.size * (style.layout === "tile" ? 0.18 : 0.28))}px`,
                  transform: `rotate(${-style.angle}deg)`,
                }}
              >
                {style.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-4 p-5">
        <p className="flex-1 text-sm text-muted">The watermark is added to all {loaded.pages} pages.</p>
        <button type="button" className="btn-primary" disabled={busy || !style.text.trim()} onClick={run}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Adding watermark…" : "Add watermark"}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
