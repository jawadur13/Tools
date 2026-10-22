"use client";

import { Download, FileText, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { FileList } from "@/components/FileList";
import { downloadBlob, formatBytes, moveItem, uid } from "@/lib/files";

type Item = { id: string; file: File; pages?: number; error?: string };

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);

  async function addFiles(files: File[]) {
    setResult(null);
    const added = await Promise.all(
      files.map(async (file): Promise<Item> => {
        try {
          const doc = await PDFDocument.load(await file.arrayBuffer());
          return { id: uid(), file, pages: doc.getPageCount() };
        } catch {
          return { id: uid(), file, error: "Can't read this PDF (it may be password-protected)" };
        }
      }),
    );
    setItems((prev) => [...prev, ...added]);
  }

  async function merge() {
    setBusy(true);
    setError("");
    try {
      const merged = await PDFDocument.create();
      for (const item of items.filter((i) => !i.error)) {
        const doc = await PDFDocument.load(await item.file.arrayBuffer());
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    } catch {
      setError("Something went wrong while merging. Please check your files and try again.");
    } finally {
      setBusy(false);
    }
  }

  const valid = items.filter((i) => !i.error);
  const totalPages = valid.reduce((s, i) => s + (i.pages ?? 0), 0);

  return (
    <div className="space-y-5">
      <FileDrop accept="application/pdf,.pdf" label="Drop PDF files here or click to choose" hint="Add two or more PDFs" onFiles={addFiles} />

      {items.length > 0 && (
        <>
          <FileList
            icon={<FileText className="size-5" />}
            items={items.map((i) => ({
              id: i.id,
              name: i.file.name,
              detail: i.error ?? `${i.pages} page${i.pages === 1 ? "" : "s"} · ${formatBytes(i.file.size)}`,
            }))}
            onMove={(from, to) => {
              setResult(null);
              setItems((prev) => moveItem(prev, from, to));
            }}
            onRemove={(id) => {
              setResult(null);
              setItems((prev) => prev.filter((p) => p.id !== id));
            }}
          />

          <div className="card flex flex-wrap items-center gap-4 p-5">
            <p className="flex-1 text-sm text-muted">
              {valid.length} file{valid.length === 1 ? "" : "s"} · {totalPages} pages total
            </p>
            {result ? (
              <button type="button" className="btn-primary" onClick={() => downloadBlob(result, "merged.pdf")}>
                <Download className="size-4" /> Download merged PDF ({formatBytes(result.size)})
              </button>
            ) : (
              <button type="button" className="btn-primary" disabled={valid.length < 2 || busy} onClick={merge}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Merging…" : "Merge PDFs"}
              </button>
            )}
          </div>
          {valid.length < 2 && <p className="text-sm text-muted">Add at least two PDFs to merge.</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
        </>
      )}
    </div>
  );
}
