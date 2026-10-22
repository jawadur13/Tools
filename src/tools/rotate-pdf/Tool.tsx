"use client";

import { Download, FileText, Loader2, RefreshCw, RotateCcw, RotateCw, X } from "lucide-react";
import { degrees, PDFDocument } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes } from "@/lib/files";

type Loaded = { file: File; pages: number };

const rotations = [
  { angle: 90, label: "90° right", icon: RotateCw },
  { angle: 180, label: "180°", icon: RefreshCw },
  { angle: 270, label: "90° left", icon: RotateCcw },
];

export default function RotatePdf() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [angle, setAngle] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addFiles([file]: File[]) {
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
      for (const page of doc.getPages()) {
        // Add to any rotation the page already has.
        page.setRotation(degrees((page.getRotation().angle + angle) % 360));
      }
      const blob = new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" });
      downloadBlob(blob, `${baseName(loaded.file.name)}-rotated.pdf`);
    } catch {
      setError("Something went wrong while rotating this PDF.");
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
        <div className="grid grid-cols-3 gap-3">
          {rotations.map(({ angle: a, label, icon: Icon }) => (
            <button
              key={a}
              type="button"
              onClick={() => setAngle(a)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition ${
                angle === a ? "border-accent bg-accent-soft text-accent" : "border-line hover:bg-surface-2"
              }`}
            >
              <Icon className="size-6" />
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary" disabled={busy} onClick={run}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Rotating…" : "Rotate & download"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
