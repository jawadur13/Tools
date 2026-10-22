"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes, uid } from "@/lib/files";

type Target = "image/jpeg" | "image/png" | "image/webp";
type Item = { id: string; file: File; thumb: string; result?: Blob; error?: string };

const targets: { type: Target; label: string; ext: string }[] = [
  { type: "image/jpeg", label: "JPG", ext: "jpg" },
  { type: "image/png", label: "PNG", ext: "png" },
  { type: "image/webp", label: "WebP", ext: "webp" },
];

async function convert(file: File, type: Target, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality / 100));
  // Some browsers silently fall back to PNG for unsupported encoders.
  if (!blob || blob.type !== type) throw new Error("Your browser can't encode this format.");
  return blob;
}

export default function ImageConverter() {
  const [items, setItems] = useState<Item[]>([]);
  const [target, setTarget] = useState<Target>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [converted, setConverted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Results are stale as soon as the target, quality or file list changes.
  const key = `${target}|${quality}|${items.map((i) => i.id).join(",")}`;
  const done = converted === key;
  const { ext, label: targetLabel } = targets.find((t) => t.type === target)!;

  function addFiles(files: File[]) {
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ id: uid(), file, thumb: URL.createObjectURL(file) })),
    ]);
  }

  async function run() {
    setBusy(true);
    const next: Item[] = [];
    for (const item of items) {
      try {
        next.push({ ...item, result: await convert(item.file, target, quality), error: undefined });
      } catch (e) {
        next.push({ ...item, result: undefined, error: e instanceof Error ? e.message : "Could not convert this image." });
      }
    }
    setItems(next);
    setConverted(`${target}|${quality}|${next.map((i) => i.id).join(",")}`);
    setBusy(false);
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.thumb);
      return prev.filter((p) => p.id !== id);
    });
  }

  function downloadAll() {
    items.forEach((item, i) => {
      if (item.result) setTimeout(() => downloadBlob(item.result!, `${baseName(item.file.name)}.${ext}`), i * 300);
    });
  }

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif"
        label="Drop images here or click to choose"
        hint="JPG, PNG, WebP, GIF, BMP or AVIF"
        onFiles={addFiles}
      />

      <div className="card grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <span className="label">Convert to</span>
          <div className="flex gap-2">
            {targets.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setTarget(t.type)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  target === t.type ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="cv-q">
            Quality: {target === "image/png" ? "lossless" : `${quality}%`}
          </label>
          <input
            id="cv-q"
            type="range"
            min={10}
            max={100}
            value={quality}
            disabled={target === "image/png"}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-accent disabled:opacity-40"
          />
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="card flex flex-wrap items-center gap-3 p-5">
            <p className="flex-1 text-sm text-muted">
              {items.length} image{items.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                items.forEach((i) => URL.revokeObjectURL(i.thumb));
                setItems([]);
              }}
            >
              <Trash2 className="size-4" /> Clear
            </button>
            {done ? (
              <button type="button" className="btn-primary" onClick={downloadAll}>
                <Download className="size-4" /> Download all
              </button>
            ) : (
              <button type="button" className="btn-primary" disabled={busy} onClick={run}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Converting…" : `Convert to ${targetLabel}`}
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {items.map((item) => {
              const result = done ? item.result : undefined;
              return (
                <li key={item.id} className="card flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                  <img src={item.thumb} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(item.file.size)}
                      {result && (
                        <>
                          {" → "}
                          <span className="font-medium text-foreground">
                            {baseName(item.file.name)}.{ext} · {formatBytes(result.size)}
                          </span>
                        </>
                      )}
                      {done && item.error && <span className="text-danger"> · {item.error}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    disabled={!result}
                    onClick={() => result && downloadBlob(result, `${baseName(item.file.name)}.${ext}`)}
                    aria-label={`Download ${item.file.name}`}
                  >
                    <Download className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-danger"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
