"use client";

import { Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes, uid } from "@/lib/files";
import { downloadAsZip } from "@/lib/zip";

type Format = "same" | "image/jpeg" | "image/webp" | "image/png";

type Result = { blob: Blob; width: number; height: number };
type Item = { id: string; file: File; thumb: string; result?: Result; error?: string };

type Settings = { quality: number; maxWidth: number; format: Format };

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };

async function compress(file: File, { quality, maxWidth, format }: Settings): Promise<Result> {
  const bitmap = await createImageBitmap(file);
  const scale = maxWidth > 0 && bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const type = format === "same" ? (extensions[file.type] ? file.type : "image/jpeg") : format;
  if (type === "image/jpeg") {
    // JPEG has no transparency; paint white instead of the default black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality / 100));
  if (!blob) throw new Error("Your browser could not encode this image.");

  // Never hand back a bigger file in the same format and size.
  if (scale === 1 && type === file.type && blob.size >= file.size) {
    return { blob: file, width, height };
  }
  return { blob, width, height };
}

export default function ImageCompressor() {
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Settings>({ quality: 75, maxWidth: 0, format: "same" });
  const run = useRef(0);
  const lastSettings = useRef(settings);

  const ids = items.map((i) => i.id).join(",");

  // Compress new files, or everything when settings change (debounced for sliders).
  useEffect(() => {
    if (!ids) return;
    const current = ++run.current;
    const timer = setTimeout(async () => {
      const settingsChanged = lastSettings.current !== settings;
      lastSettings.current = settings;
      const queue = settingsChanged ? items : items.filter((i) => !i.result && !i.error);
      if (settingsChanged) {
        setItems((prev) => prev.map((p) => ({ ...p, result: undefined, error: undefined })));
      }
      for (const item of queue) {
        try {
          const result = await compress(item.file, settings);
          if (run.current !== current) return;
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, result, error: undefined } : p)));
        } catch (e) {
          if (run.current !== current) return;
          const error = e instanceof Error ? e.message : "Could not process this image.";
          setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, error } : p)));
        }
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `items` is tracked through `ids`
  }, [ids, settings]);

  function addFiles(files: File[]) {
    setItems((prev) => [...prev, ...files.map((file) => ({ id: uid(), file, thumb: URL.createObjectURL(file) }))]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.thumb);
      return prev.filter((p) => p.id !== id);
    });
  }

  function clearAll() {
    items.forEach((i) => URL.revokeObjectURL(i.thumb));
    setItems([]);
  }

  function outputName(item: Item) {
    const type = item.result?.blob.type || item.file.type;
    return `${baseName(item.file.name)}-compressed.${extensions[type] ?? "jpg"}`;
  }

  function downloadAll() {
    const entries = items.flatMap((item) => (item.result ? [{ name: outputName(item), blob: item.result.blob }] : []));
    downloadAsZip(entries, "compressed-images.zip");
  }

  const totalBefore = items.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = items.reduce((s, i) => s + (i.result?.blob.size ?? i.file.size), 0);
  const done = items.length > 0 && items.every((i) => i.result || i.error);
  const saved = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/jpeg,image/png,image/webp"
        label="Drop images here or click to choose"
        hint="JPG, PNG or WebP · as many as you like"
        onFiles={addFiles}
      />

      <div className="card grid gap-5 p-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="ic-quality">
            Quality: {settings.quality}%
          </label>
          <input
            id="ic-quality"
            type="range"
            min={10}
            max={100}
            value={settings.quality}
            onChange={(e) => setSettings({ ...settings, quality: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="label" htmlFor="ic-width">Max width (px)</label>
          <input
            id="ic-width"
            type="number"
            min={0}
            placeholder="Original"
            value={settings.maxWidth || ""}
            onChange={(e) => setSettings({ ...settings, maxWidth: Math.max(0, Number(e.target.value)) })}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="ic-format">Output format</label>
          <select
            id="ic-format"
            className="field"
            value={settings.format}
            onChange={(e) => setSettings({ ...settings, format: e.target.value as Format })}
          >
            <option value="same">Same as original</option>
            <option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP (smallest)</option>
            <option value="image/png">PNG (lossless)</option>
          </select>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <div className="flex-1">
              <p className="font-semibold">
                {formatBytes(totalBefore)} → {done ? formatBytes(totalAfter) : "…"}
              </p>
              <p className="text-sm text-muted">
                {items.length} image{items.length > 1 ? "s" : ""}
                {done && saved > 0 && <span className="font-medium text-success"> · {saved}% smaller</span>}
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={clearAll}>
              <Trash2 className="size-4" /> Clear
            </button>
            <button type="button" className="btn-primary" disabled={!done} onClick={downloadAll}>
              <Download className="size-4" /> Download all
            </button>
          </div>

          <ul className="space-y-2">
            {items.map((item) => {
              const after = item.result?.blob.size;
              const pct = after !== undefined ? Math.round((1 - after / item.file.size) * 100) : null;
              return (
                <li key={item.id} className="card flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                  <img src={item.thumb} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(item.file.size)}
                      {item.result && (
                        <>
                          {" → "}
                          <span className="font-medium text-foreground">{formatBytes(item.result.blob.size)}</span>
                          {" · "}
                          {item.result.width}×{item.result.height}
                          {pct !== null && pct > 0 && <span className="text-success"> · −{pct}%</span>}
                          {pct !== null && pct <= 0 && <span> · already optimized</span>}
                        </>
                      )}
                      {item.error && <span className="text-danger"> · {item.error}</span>}
                      {!item.result && !item.error && " · compressing…"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    disabled={!item.result}
                    onClick={() => item.result && downloadBlob(item.result.blob, outputName(item))}
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
