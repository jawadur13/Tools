"use client";

import { ArrowLeft, ArrowRight, Download, FileText, Loader2, RotateCw, Trash2, Undo2, X } from "lucide-react";
import { degrees, PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes, moveItem } from "@/lib/files";

/** One page in the working order: `source` is its 0-based index in the original PDF. */
type Page = { source: number; thumb: string; rotation: number };

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs;
}

async function renderThumbnails(file: File, onPage: (page: Page) => void, isCancelled: () => boolean) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    for (let n = 1; n <= doc.numPages; n++) {
      if (isCancelled()) return;
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      // Thumbnails ~240px wide are sharp on retina screens yet cheap to render.
      const viewport = page.getViewport({ scale: 240 / base.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      onPage({ source: n - 1, thumb: canvas.toDataURL("image/jpeg", 0.8), rotation: 0 });
    }
  } finally {
    await task.destroy();
  }
}

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<Page[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = useRef(0);

  async function load(f: File) {
    const id = ++run.current;
    setFile(f);
    setPages([]);
    setOriginal([]);
    setError("");
    setLoading(true);
    try {
      await renderThumbnails(
        f,
        (page) => {
          setPages((prev) => [...prev, page]);
          setOriginal((prev) => [...prev, page]);
        },
        () => run.current !== id,
      );
    } catch {
      if (run.current === id) setError("Can't read this PDF. It may be damaged or password-protected.");
    } finally {
      if (run.current === id) setLoading(false);
    }
  }

  function reset() {
    run.current++;
    setFile(null);
    setPages([]);
    setOriginal([]);
    setLoading(false);
    setError("");
  }

  function update(i: number, change: (p: Page) => Page) {
    setPages((prev) => prev.map((p, j) => (j === i ? change(p) : p)));
  }

  async function save() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p.source));
      copied.forEach((page, i) => {
        const extra = pages[i].rotation;
        if (extra) page.setRotation(degrees((page.getRotation().angle + extra) % 360));
        out.addPage(page);
      });
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/pdf" }), `${baseName(file.name)}-organized.pdf`);
    } catch {
      setError("Something went wrong while saving. The PDF may be password-protected.");
    } finally {
      setBusy(false);
    }
  }

  if (!file) {
    return (
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        label="Drop a PDF here or click to choose"
        hint="You'll see every page as a thumbnail"
        onFiles={([f]) => load(f)}
      />
    );
  }

  const changed =
    pages.length !== original.length || pages.some((p, i) => p.source !== original[i]?.source || p.rotation !== 0);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted">
            {formatBytes(file.size)} · {loading ? `loading pages… ${pages.length}` : `${pages.length} of ${original.length} pages kept`}
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={!changed || loading}
          onClick={() => setPages(original)}
        >
          <Undo2 className="size-4" /> Start over
        </button>
        <button type="button" className="btn-primary" disabled={loading || busy || pages.length === 0} onClick={save}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Saving…" : "Save PDF"}
        </button>
        <button
          type="button"
          aria-label="Choose another PDF"
          onClick={reset}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="size-4" />
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {!loading && pages.length === 0 && original.length > 0 && (
        <p className="text-sm text-muted">All pages are deleted. Click “Start over” to restore them.</p>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {pages.map((p, i) => (
          <li key={p.source} className="card overflow-hidden">
            <div className="flex aspect-[3/4] items-center justify-center bg-surface-2 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered data URL */}
              <img
                src={p.thumb}
                alt={`Page ${p.source + 1}`}
                style={{ transform: `rotate(${p.rotation}deg)` }}
                className="max-h-full max-w-full shadow-sm transition-transform"
              />
            </div>
            <div className="flex items-center justify-between gap-1 border-t border-line px-2 py-1.5">
              <button
                type="button"
                aria-label={`Move page ${p.source + 1} left`}
                disabled={i === 0}
                onClick={() => setPages((prev) => moveItem(prev, i, i - 1))}
                className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
              >
                <ArrowLeft className="size-4" />
              </button>
              <span className="text-xs font-medium text-muted">
                {i + 1}
                {p.source !== i && <span className="opacity-70"> (was {p.source + 1})</span>}
              </span>
              <div className="flex">
                <button
                  type="button"
                  aria-label={`Rotate page ${p.source + 1}`}
                  onClick={() => update(i, (pg) => ({ ...pg, rotation: (pg.rotation + 90) % 360 }))}
                  className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  <RotateCw className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Delete page ${p.source + 1}`}
                  onClick={() => setPages((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Move page ${p.source + 1} right`}
                  disabled={i === pages.length - 1}
                  onClick={() => setPages((prev) => moveItem(prev, i, i + 1))}
                  className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
        {loading && (
          <li className="card flex aspect-[3/4] items-center justify-center text-muted">
            <Loader2 className="size-5 animate-spin" />
          </li>
        )}
      </ul>
    </div>
  );
}
