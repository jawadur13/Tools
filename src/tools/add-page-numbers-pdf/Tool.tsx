"use client";

import { Download, FileText, Loader2, X } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Vertical = "top" | "bottom";
type Horizontal = "left" | "center" | "right";
type Format = "n" | "page-n" | "page-n-of-total" | "n-slash-total";

const formats: { id: Format; label: string }[] = [
  { id: "n", label: "1" },
  { id: "page-n", label: "Page 1" },
  { id: "page-n-of-total", label: "Page 1 of 10" },
  { id: "n-slash-total", label: "1 / 10" },
];

function formatNumber(format: Format, n: number, total: number) {
  switch (format) {
    case "n":
      return String(n);
    case "page-n":
      return `Page ${n}`;
    case "page-n-of-total":
      return `Page ${n} of ${total}`;
    case "n-slash-total":
      return `${n} / ${total}`;
  }
}

type Loaded = { file: File; pages: number };

export default function AddPageNumbersPdf() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [vertical, setVertical] = useState<Vertical>("bottom");
  const [horizontal, setHorizontal] = useState<Horizontal>("center");
  const [format, setFormat] = useState<Format>("page-n-of-total");
  const [start, setStart] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [margin, setMargin] = useState(28);
  const [skipFirst, setSkipFirst] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
    if (!loaded) return;
    setBusy(true);
    setError("");
    try {
      const doc = await PDFDocument.load(await loaded.file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const numbered = skipFirst ? pages.slice(1) : pages;
      const total = numbered.length + start - 1;

      numbered.forEach((page, i) => {
        const text = formatNumber(format, start + i, total);
        const width = font.widthOfTextAtSize(text, fontSize);
        // Use the visible area so cropped PDFs are numbered inside the page.
        const box = page.getCropBox();
        const x =
          horizontal === "left"
            ? box.x + margin
            : horizontal === "right"
              ? box.x + box.width - margin - width
              : box.x + (box.width - width) / 2;
        const y = vertical === "bottom" ? box.y + margin : box.y + box.height - margin - fontSize;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const bytes = await doc.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${baseName(loaded.file.name)}-numbered.pdf`);
    } catch {
      setError("Something went wrong while adding page numbers.");
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

  const preview = formatNumber(format, start, (skipFirst ? loaded.pages - 1 : loaded.pages) + start - 1);

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

      <div className="card grid gap-6 p-5 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="label">Position</p>
          {/* A miniature page: click one of the six slots. */}
          <div className="flex h-44 w-34 flex-col justify-between rounded-lg border border-line bg-surface-2 p-2 shadow-sm">
            {(["top", "bottom"] as Vertical[]).map((v) => (
              <div key={v} className="grid grid-cols-3 gap-1.5">
                {(["left", "center", "right"] as Horizontal[]).map((h) => {
                  const active = vertical === v && horizontal === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      aria-label={`${v} ${h}`}
                      aria-pressed={active}
                      onClick={() => {
                        setVertical(v);
                        setHorizontal(h);
                      }}
                      className={`h-7 rounded-md border text-[10px] font-semibold transition ${
                        active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-muted hover:border-accent/60"
                      }`}
                    >
                      {active ? "1" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pn-format">Format</label>
            <select id="pn-format" className="field" value={format} onChange={(e) => setFormat(e.target.value as Format)}>
              {formats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pn-start">Start at</label>
            <input
              id="pn-start"
              type="number"
              min={0}
              className="field"
              value={start}
              onChange={(e) => setStart(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            />
          </div>
          <div>
            <label className="label" htmlFor="pn-size">Font size: {fontSize}pt</label>
            <input
              id="pn-size"
              type="range"
              min={6}
              max={36}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="pn-margin">Distance from edge: {margin}pt</label>
            <input
              id="pn-margin"
              type="range"
              min={8}
              max={72}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} />
            Skip first page (e.g. a cover)
          </label>
        </div>
      </div>

      <div className="card flex flex-wrap items-center gap-4 p-5">
        <p className="flex-1 text-sm text-muted">
          First number will read <span className="font-medium text-foreground">“{preview}”</span>
        </p>
        <button type="button" className="btn-primary" disabled={busy || (skipFirst && loaded.pages < 2)} onClick={run}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Adding numbers…" : "Add page numbers"}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
