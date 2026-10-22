"use client";

import { Download, FileText, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Format = "image/jpeg" | "image/png";
type Page = { index: number; blob: Blob; url: string; width: number; height: number };

const scales = [
  { value: 1, label: "Normal (1x)" },
  { value: 2, label: "High (2x)" },
  { value: 3, label: "Very high (3x)" },
];

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs;
}

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [scale, setScale] = useState(2);
  const [pages, setPages] = useState<Page[]>([]);
  const [renderedFor, setRenderedFor] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const run = useRef(0);

  const key = `${file?.name}|${file?.size}|${format}|${scale}`;
  const current = renderedFor === key || progress ? pages : [];
  const ext = format === "image/jpeg" ? "jpg" : "png";

  function reset() {
    run.current++;
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    setRenderedFor("");
    setProgress(null);
  }

  async function convert() {
    if (!file) return;
    reset();
    const id = run.current;
    setError("");
    try {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      const doc = await task.promise;
      setProgress({ done: 0, total: doc.numPages });
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d")!;
        // White page background so transparent PDFs don't turn black as JPG.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, format, 0.92));
        if (run.current !== id) return;
        if (!blob) throw new Error("encode");
        const result = { index: n, blob, url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height };
        setPages((prev) => [...prev, result]);
        setProgress({ done: n, total: doc.numPages });
      }
      await task.destroy();
      setRenderedFor(key);
    } catch {
      if (run.current === id) setError("Can't convert this PDF. It may be damaged or password-protected.");
    } finally {
      if (run.current === id) setProgress(null);
    }
  }

  const name = (p: Page) => `${baseName(file?.name ?? "document")}-page-${p.index}.${ext}`;

  function downloadAll() {
    current.forEach((p, i) => setTimeout(() => downloadBlob(p.blob, name(p)), i * 300));
  }

  if (!file) {
    return (
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        label="Drop a PDF here or click to choose"
        hint="Every page becomes an image"
        onFiles={([f]) => setFile(f)}
      />
    );
  }

  const busy = progress !== null;

  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          aria-label="Choose another PDF"
          onClick={() => {
            reset();
            setFile(null);
          }}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="card grid items-end gap-5 p-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="pj-format">Image format</label>
          <select id="pj-format" className="field" value={format} disabled={busy} onChange={(e) => setFormat(e.target.value as Format)}>
            <option value="image/jpeg">JPG (smaller files)</option>
            <option value="image/png">PNG (lossless)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pj-scale">Quality</label>
          <select id="pj-scale" className="field" value={scale} disabled={busy} onChange={(e) => setScale(Number(e.target.value))}>
            {scales.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {renderedFor === key && current.length > 0 ? (
          <button type="button" className="btn-primary" onClick={downloadAll}>
            <Download className="size-4" /> Download all ({current.length})
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={busy} onClick={convert}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? `Converting ${progress.done}/${progress.total}…` : `Convert to ${ext.toUpperCase()}`}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {current.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {current.map((p) => (
            <li key={p.index} className="card overflow-hidden">
              <div className="flex aspect-[3/4] items-center justify-center bg-surface-2 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                <img src={p.url} alt={`Page ${p.index}`} className="max-h-full max-w-full shadow-sm" />
              </div>
              <div className="flex items-center gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Page {p.index}</p>
                  <p className="text-xs text-muted">
                    {p.width}×{p.height} · {formatBytes(p.blob.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary px-3"
                  onClick={() => downloadBlob(p.blob, name(p))}
                  aria-label={`Download page ${p.index}`}
                >
                  <Download className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
