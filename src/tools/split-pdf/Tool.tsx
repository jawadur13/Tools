"use client";

import { Download, FileText, Loader2, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Mode = "range" | "every";
type Loaded = { file: File; pages: number };

/** Parses "1-3, 5, 8-10" into zero-based page indices, or returns an error message. */
function parseRanges(input: string, pageCount: number): number[] | string {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return "Enter the pages you want, e.g. 1-3, 5";
  const pages: number[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) return `“${part}” isn't a valid page or range.`;
    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) {
      return `“${part}” is outside this PDF (it has ${pageCount} pages).`;
    }
    const step = start <= end ? 1 : -1;
    for (let p = start; p !== end + step; p += step) pages.push(p - 1);
  }
  return pages;
}

async function pdfBlob(doc: PDFDocument) {
  return new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" });
}

export default function SplitPdf() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [mode, setMode] = useState<Mode>("range");
  const [range, setRange] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const parsed = loaded && mode === "range" ? parseRanges(range, loaded.pages) : null;
  const rangeError = typeof parsed === "string" ? parsed : "";

  async function addFiles([file]: File[]) {
    setError("");
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      setLoaded({ file, pages: doc.getPageCount() });
      setRange(doc.getPageCount() > 1 ? `1-${Math.min(3, doc.getPageCount())}` : "1");
    } catch {
      setError("Can't read this PDF. It may be damaged or password-protected.");
    }
  }

  async function run() {
    if (!loaded) return;
    setBusy(true);
    setError("");
    try {
      const source = await PDFDocument.load(await loaded.file.arrayBuffer());
      const name = baseName(loaded.file.name);
      if (mode === "range" && Array.isArray(parsed)) {
        const out = await PDFDocument.create();
        (await out.copyPages(source, parsed)).forEach((p) => out.addPage(p));
        downloadBlob(await pdfBlob(out), `${name}-pages-${range.replace(/\s+/g, "")}.pdf`);
      } else {
        for (let i = 0; i < loaded.pages; i++) {
          const out = await PDFDocument.create();
          const [page] = await out.copyPages(source, [i]);
          out.addPage(page);
          downloadBlob(await pdfBlob(out), `${name}-page-${i + 1}.pdf`);
          // Browsers drop rapid-fire downloads, so give each one a moment.
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch {
      setError("Something went wrong while splitting this PDF.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        <FileDrop accept="application/pdf,.pdf" multiple={false} label="Drop a PDF here or click to choose" hint="One PDF file" onFiles={addFiles} />
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

      <div className="card space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "range", label: "Extract pages" },
              { id: "every", label: "Split every page" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === m.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "range" ? (
          <div>
            <label className="label" htmlFor="sp-range">Pages to extract</label>
            <input id="sp-range" className="field" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 1-3, 5, 8-10" />
            <p className={`mt-1.5 text-xs ${rangeError ? "text-danger" : "text-muted"}`}>
              {rangeError ||
                `${(parsed as number[]).length} page${(parsed as number[]).length === 1 ? "" : "s"} will be saved as one PDF.`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            You&apos;ll get {loaded.pages} separate PDF files, one per page. Your browser may ask permission to download multiple files.
          </p>
        )}

        <button type="button" className="btn-primary" disabled={busy || !!rangeError} onClick={run}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Splitting…" : mode === "range" ? "Extract & download" : `Split into ${loaded.pages} files`}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
