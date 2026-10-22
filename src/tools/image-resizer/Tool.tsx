"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, formatBytes, uid } from "@/lib/files";

type Mode = "pixels" | "percent" | "preset";
type Item = { id: string; file: File; thumb: string; width: number; height: number };
type Result = { blob: Blob; width: number; height: number };

const presets = [
  { id: "ig-post", label: "Instagram post", width: 1080, height: 1080 },
  { id: "ig-story", label: "Instagram story", width: 1080, height: 1920 },
  { id: "fb-cover", label: "Facebook cover", width: 820, height: 312 },
  { id: "yt-thumb", label: "YouTube thumbnail", width: 1280, height: 720 },
  { id: "passport", label: "Passport (35×45 mm)", width: 413, height: 531 },
];

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };

type Settings = {
  mode: Mode;
  width: number;
  height: number;
  lock: boolean;
  percent: number;
  preset: string;
};

/** Target canvas size plus the source rectangle to draw (for center-crop presets). */
function plan(item: Item, s: Settings) {
  const full = { sx: 0, sy: 0, sw: item.width, sh: item.height };
  if (s.mode === "percent") {
    const k = s.percent / 100;
    return { w: Math.max(1, Math.round(item.width * k)), h: Math.max(1, Math.round(item.height * k)), ...full };
  }
  if (s.mode === "pixels") {
    if (!s.lock) return { w: s.width || item.width, h: s.height || item.height, ...full };
    const k = s.width ? s.width / item.width : s.height ? s.height / item.height : 1;
    return { w: Math.max(1, Math.round(item.width * k)), h: Math.max(1, Math.round(item.height * k)), ...full };
  }
  const p = presets.find((x) => x.id === s.preset) ?? presets[0];
  // Cover: crop the source to the preset's aspect ratio around the center.
  const targetRatio = p.width / p.height;
  const sourceRatio = item.width / item.height;
  let sw = item.width;
  let sh = item.height;
  if (sourceRatio > targetRatio) sw = item.height * targetRatio;
  else sh = item.width / targetRatio;
  return { w: p.width, h: p.height, sx: (item.width - sw) / 2, sy: (item.height - sh) / 2, sw, sh };
}

async function resize(item: Item, s: Settings): Promise<Result> {
  const { w, h, sx, sy, sw, sh } = plan(item, s);
  const bitmap = await createImageBitmap(item.file);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const type = extensions[item.file.type] ? item.file.type : "image/png";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.92));
  if (!blob) throw new Error("Could not encode image");
  return { blob, width: w, height: h };
}

export default function ImageResizer() {
  const [items, setItems] = useState<Item[]>([]);
  const [settings, setSettings] = useState<Settings>({
    mode: "pixels",
    width: 1080,
    height: 0,
    lock: true,
    percent: 50,
    preset: "ig-post",
  });
  const [results, setResults] = useState<{ key: string; map: Record<string, Result> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Results are only valid for the exact files + settings they were made with.
  const key = JSON.stringify(settings) + items.map((i) => i.id).join(",");
  const current = results?.key === key ? results.map : null;

  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  async function addFiles(files: File[]) {
    const added: Item[] = [];
    for (const file of files) {
      try {
        const bmp = await createImageBitmap(file);
        added.push({ id: uid(), file, thumb: URL.createObjectURL(file), width: bmp.width, height: bmp.height });
        bmp.close();
      } catch {
        setError(`Couldn't read ${file.name}.`);
      }
    }
    setItems((prev) => [...prev, ...added]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.thumb);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function run() {
    setBusy(true);
    setError("");
    try {
      const map: Record<string, Result> = {};
      for (const item of items) map[item.id] = await resize(item, settings);
      setResults({ key, map });
    } catch {
      setError("Something went wrong while resizing. Please try other images.");
    } finally {
      setBusy(false);
    }
  }

  const fileName = (item: Item, r: Result) =>
    `${baseName(item.file.name)}-${r.width}x${r.height}.${extensions[r.blob.type] ?? "png"}`;

  function downloadAll() {
    if (!current) return;
    items.forEach((item, i) => {
      const r = current[item.id];
      if (r) setTimeout(() => downloadBlob(r.blob, fileName(item, r)), i * 300);
    });
  }

  const modes: { id: Mode; label: string }[] = [
    { id: "pixels", label: "By pixels" },
    { id: "percent", label: "By percentage" },
    { id: "preset", label: "Presets" },
  ];

  return (
    <div className="space-y-5">
      <FileDrop accept="image/jpeg,image/png,image/webp" label="Drop images here or click to choose" hint="JPG, PNG or WebP" onFiles={addFiles} />

      <div className="card space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => set({ mode: m.id })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                settings.mode === m.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {settings.mode === "pixels" && (
          <div className="grid items-end gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="ir-w">Width (px)</label>
              <input
                id="ir-w"
                type="number"
                min={0}
                className="field"
                placeholder="Auto"
                value={settings.width || ""}
                onChange={(e) => set({ width: Math.max(0, Number(e.target.value)), ...(settings.lock ? { height: 0 } : {}) })}
              />
            </div>
            <div>
              <label className="label" htmlFor="ir-h">Height (px)</label>
              <input
                id="ir-h"
                type="number"
                min={0}
                className="field"
                placeholder="Auto"
                value={settings.height || ""}
                onChange={(e) => set({ height: Math.max(0, Number(e.target.value)), ...(settings.lock ? { width: 0 } : {}) })}
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={settings.lock} onChange={(e) => set({ lock: e.target.checked })} />
              Lock aspect ratio
            </label>
          </div>
        )}

        {settings.mode === "percent" && (
          <div>
            <label className="label" htmlFor="ir-pct">
              Scale: {settings.percent}%
            </label>
            <input
              id="ir-pct"
              type="range"
              min={5}
              max={200}
              step={5}
              value={settings.percent}
              onChange={(e) => set({ percent: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
        )}

        {settings.mode === "preset" && (
          <div className="grid gap-2 sm:grid-cols-3">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set({ preset: p.id })}
                className={`rounded-xl border p-3 text-left text-sm transition ${
                  settings.preset === p.id ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"
                }`}
              >
                <span className="block font-medium">{p.label}</span>
                <span className="text-xs text-muted">
                  {p.width} × {p.height}px
                </span>
              </button>
            ))}
          </div>
        )}
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
            {current ? (
              <button type="button" className="btn-primary" onClick={downloadAll}>
                <Download className="size-4" /> Download all
              </button>
            ) : (
              <button type="button" className="btn-primary" disabled={busy} onClick={run}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Resizing…" : "Resize images"}
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {items.map((item) => {
              const r = current?.[item.id];
              return (
                <li key={item.id} className="card flex items-center gap-3 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                  <img src={item.thumb} alt="" className="size-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted">
                      {item.width}×{item.height} · {formatBytes(item.file.size)}
                      {r && (
                        <>
                          {" → "}
                          <span className="font-medium text-foreground">
                            {r.width}×{r.height} · {formatBytes(r.blob.size)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    disabled={!r}
                    onClick={() => r && downloadBlob(r.blob, fileName(item, r))}
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
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
