"use client";

import { Download, FileText, Info, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs;
}

async function extractPages(file: File, onProgress: (done: number, total: number) => void): Promise<string[]> {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    const pages: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      let text = "";
      for (const item of content.items) {
        // Marked-content entries carry no text.
        if (!("str" in item)) continue;
        text += item.str;
        if (item.hasEOL) text += "\n";
      }
      pages.push(
        text
          .split("\n")
          .map((line) => line.replace(/[ \t]+/g, " ").trimEnd())
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim(),
      );
      onProgress(n, doc.numPages);
    }
    return pages;
  } finally {
    await task.destroy();
  }
}

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[] | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [separators, setSeparators] = useState(true);
  const [error, setError] = useState("");
  const run = useRef(0);

  async function load(f: File) {
    const id = ++run.current;
    setFile(f);
    setPages(null);
    setError("");
    setProgress({ done: 0, total: 0 });
    try {
      const result = await extractPages(f, (done, total) => run.current === id && setProgress({ done, total }));
      if (run.current === id) setPages(result);
    } catch {
      if (run.current === id) setError("Can't read this PDF. It may be damaged or password-protected.");
    } finally {
      if (run.current === id) setProgress(null);
    }
  }

  function reset() {
    run.current++;
    setFile(null);
    setPages(null);
    setProgress(null);
    setError("");
  }

  if (!file) {
    return (
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        label="Drop a PDF here or click to choose"
        hint="Text is extracted from every page"
        onFiles={([f]) => load(f)}
      />
    );
  }

  const text = pages
    ? separators
      ? pages.map((p, i) => `--- Page ${i + 1} ---\n\n${p}`).join("\n\n")
      : pages.filter(Boolean).join("\n\n")
    : "";
  const empty = pages !== null && pages.every((p) => !p);
  const words = pages ? (pages.join(" ").match(/\S+/g) ?? []).length : 0;

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-accent-soft text-accent">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted">
            {formatBytes(file.size)}
            {pages && ` · ${pages.length} page${pages.length === 1 ? "" : "s"} · ${words.toLocaleString()} words`}
          </p>
        </div>
        <button
          type="button"
          aria-label="Choose another PDF"
          onClick={reset}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="size-4" />
        </button>
      </div>

      {progress && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" />
          {progress.total ? `Extracting page ${progress.done} of ${progress.total}…` : "Opening PDF…"}
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      {empty && (
        <div className="card flex gap-3 p-5 text-sm">
          <Info className="size-5 shrink-0 text-accent" />
          <p className="text-muted">
            No text was found. This usually means the PDF is a scan or a photo of a document — its pages are images, so
            the text would need OCR (text recognition) to extract.
          </p>
        </div>
      )}

      {pages && !empty && (
        <div className="card overflow-hidden">
          <textarea
            readOnly
            value={text}
            aria-label="Extracted text"
            className="block min-h-96 w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed outline-none"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
            <label className="flex flex-1 items-center gap-2 text-sm">
              <input type="checkbox" checked={separators} onChange={(e) => setSeparators(e.target.checked)} />
              Show page separators
            </label>
            <CopyButton text={text} className="btn-secondary py-1.5" />
            <button
              type="button"
              className="btn-primary py-1.5"
              onClick={() => downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), `${baseName(file.name)}.txt`)}
            >
              <Download className="size-4" /> Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
