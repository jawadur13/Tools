"use client";

import JsBarcode from "jsbarcode";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadBlob } from "@/lib/files";

const formats = [
  { id: "CODE128", label: "Code 128", sample: "JR-TOOLS-2026", hint: "Any text or numbers" },
  { id: "EAN13", label: "EAN-13", sample: "590123412345", hint: "12 digits (check digit added) or 13 digits" },
  { id: "EAN8", label: "EAN-8", sample: "9638507", hint: "7 digits (check digit added) or 8 digits" },
  { id: "UPC", label: "UPC-A", sample: "12345678901", hint: "11 digits (check digit added) or 12 digits" },
  { id: "CODE39", label: "Code 39", sample: "CODE39 TEXT", hint: "A–Z, 0–9, space and - . $ / + %" },
  { id: "ITF14", label: "ITF-14", sample: "1234567890123", hint: "13 digits (check digit added) or 14 digits" },
  { id: "MSI", label: "MSI", sample: "123456", hint: "Digits only" },
  { id: "pharmacode", label: "Pharmacode", sample: "1234", hint: "A number from 3 to 131070" },
];

type Options = {
  format: string;
  value: string;
  width: number;
  height: number;
  displayValue: boolean;
  lineColor: string;
  background: string;
  margin: number;
};

/** Renders the barcode into a detached SVG and returns its markup, or null if the value is invalid. */
function renderSvg(o: Options): { markup: string; width: number; height: number } | null {
  if (!o.value) return null;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let valid = true;
  try {
    JsBarcode(svg, o.value, {
      format: o.format,
      width: o.width,
      height: o.height,
      displayValue: o.displayValue,
      lineColor: o.lineColor,
      background: o.background,
      margin: o.margin,
      font: "monospace",
      valid: (ok) => {
        valid = ok;
      },
    });
  } catch {
    return null;
  }
  if (!valid) return null;
  return {
    markup: new XMLSerializer().serializeToString(svg),
    width: Number.parseFloat(svg.getAttribute("width") ?? "0"),
    height: Number.parseFloat(svg.getAttribute("height") ?? "0"),
  };
}

export default function BarcodeGenerator() {
  const [o, setO] = useState<Options>({
    format: "CODE128",
    value: formats[0].sample,
    width: 2,
    height: 100,
    displayValue: true,
    lineColor: "#000000",
    background: "#ffffff",
    margin: 10,
  });
  const set = <K extends keyof Options>(key: K, value: Options[K]) => setO((prev) => ({ ...prev, [key]: value }));

  const barcode = useMemo(() => renderSvg(o), [o]);
  const format = formats.find((f) => f.id === o.format)!;
  const filename = `barcode-${o.format.toLowerCase()}-${o.value.replace(/[^\w-]+/g, "_").slice(0, 40)}`;

  function downloadSvg() {
    if (barcode) downloadBlob(new Blob([barcode.markup], { type: "image/svg+xml" }), `${filename}.svg`);
  }

  async function downloadPng() {
    if (!barcode) return;
    const scale = 3; // crisp enough for print at typical label sizes
    const url = URL.createObjectURL(new Blob([barcode.markup], { type: "image/svg+xml" }));
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(barcode.width * scale);
      canvas.height = Math.round(barcode.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (blob) downloadBlob(blob, `${filename}.png`);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="card grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="bc-format">Barcode type</label>
          <select
            id="bc-format"
            className="field"
            value={o.format}
            onChange={(e) => {
              const next = formats.find((f) => f.id === e.target.value)!;
              setO((prev) => ({ ...prev, format: next.id, value: next.sample }));
            }}
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="bc-value">Value</label>
          <input
            id="bc-value"
            className="field font-mono"
            value={o.value}
            onChange={(e) => set("value", e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
          <p className={`mt-1.5 text-xs ${o.value && !barcode ? "text-danger" : "text-muted"}`}>
            {o.value && !barcode ? `Not a valid ${format.label} value. ${format.hint}.` : format.hint}
          </p>
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bc-width">Bar width: {o.width}</label>
            <input
              id="bc-width"
              type="range"
              min={1}
              max={4}
              step={1}
              value={o.width}
              onChange={(e) => set("width", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="bc-height">Height: {o.height}px</label>
            <input
              id="bc-height"
              type="range"
              min={30}
              max={200}
              step={5}
              value={o.height}
              onChange={(e) => set("height", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="bc-margin">Margin: {o.margin}px</label>
            <input
              id="bc-margin"
              type="range"
              min={0}
              max={40}
              value={o.margin}
              onChange={(e) => set("margin", Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label className="label" htmlFor="bc-line">Bars</label>
              <input
                id="bc-line"
                type="color"
                value={o.lineColor}
                onChange={(e) => set("lineColor", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface"
              />
            </div>
            <div>
              <label className="label" htmlFor="bc-bg">Background</label>
              <input
                id="bc-bg"
                type="color"
                value={o.background}
                onChange={(e) => set("background", e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={o.displayValue} onChange={(e) => set("displayValue", e.target.checked)} />
            Show text below the barcode
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex min-h-56 flex-1 items-center justify-center overflow-auto rounded-2xl border border-line bg-surface-2 p-4">
          {barcode ? (
            <div
              className="max-w-full [&>svg]:h-auto [&>svg]:max-w-full"
              // Markup comes from JsBarcode rendering the user's value into SVG text nodes, not raw HTML.
              dangerouslySetInnerHTML={{ __html: barcode.markup }}
            />
          ) : (
            <p className="text-center text-sm text-muted">Enter a valid value to see your barcode</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-primary" disabled={!barcode} onClick={downloadPng}>
            <Download className="size-4" /> PNG
          </button>
          <button type="button" className="btn-secondary" disabled={!barcode} onClick={downloadSvg}>
            <Download className="size-4" /> SVG
          </button>
        </div>
      </div>
    </div>
  );
}
