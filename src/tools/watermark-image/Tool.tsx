"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, uid } from "@/lib/files";
import { downloadAsZip } from "@/lib/zip";

type Item = { id: string; file: File; thumb: string };
type Position = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br" | "tile";
type Settings = {
  mode: "text" | "logo";
  text: string;
  size: number; // % of image width: font size for text, logo width for logos
  color: string;
  opacity: number; // 0-100
  position: Position;
};
type Logo = { name: string; bitmap: ImageBitmap };

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const grid: Position[] = ["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"];
const positionNames: Record<string, string> = {
  tl: "Top left", tc: "Top center", tr: "Top right",
  ml: "Middle left", mc: "Center", mr: "Middle right",
  bl: "Bottom left", bc: "Bottom center", br: "Bottom right",
};
const PREVIEW_MAX = 900;

/** Draws the watermark onto a canvas of size w×h. Everything scales with the image width. */
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, s: Settings, logo: Logo | null) {
  const margin = w * 0.03;
  ctx.save();
  ctx.globalAlpha = s.opacity / 100;

  let mw: number; // mark width/height
  let mh: number;
  let paint: (x: number, y: number) => void; // draws the mark with its top-left at x,y

  if (s.mode === "logo") {
    if (!logo) {
      ctx.restore();
      return;
    }
    mw = (w * s.size) / 100;
    mh = (mw * logo.bitmap.height) / logo.bitmap.width;
    paint = (x, y) => ctx.drawImage(logo.bitmap, x, y, mw, mh);
  } else {
    if (!s.text.trim()) {
      ctx.restore();
      return;
    }
    const font = Math.max(8, (w * s.size) / 100);
    ctx.font = `600 ${font}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillStyle = s.color;
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = font * 0.15;
    mw = ctx.measureText(s.text).width;
    mh = font * 1.15;
    paint = (x, y) => ctx.fillText(s.text, x, y);
  }

  if (s.position === "tile") {
    // Repeat diagonally, covering the image even after rotation.
    const stepX = mw + Math.max(mh, w * 0.05) * 2.5;
    const stepY = mh * 3.5;
    const diag = Math.hypot(w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 6);
    let row = 0;
    for (let y = -diag; y < diag; y += stepY, row++) {
      const offset = row % 2 ? stepX / 2 : 0;
      for (let x = -diag - offset; x < diag; x += stepX) paint(x, y);
    }
  } else {
    const col = s.position[1];
    const rowPos = s.position[0];
    const x = col === "l" ? margin : col === "c" ? (w - mw) / 2 : w - mw - margin;
    const y = rowPos === "t" ? margin : rowPos === "m" ? (h - mh) / 2 : h - mh - margin;
    paint(x, y);
  }
  ctx.restore();
}

async function render(file: File, s: Settings, logo: Logo | null): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  const type = extensions[file.type] ? file.type : "image/png";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  drawWatermark(ctx, canvas.width, canvas.height, s, logo);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.92));
  if (!blob) throw new Error("Could not encode image");
  return blob;
}

export default function WatermarkImage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    mode: "text",
    text: "© Your Brand",
    size: 5,
    color: "#ffffff",
    opacity: 60,
    position: "br",
  });
  const [logo, setLogo] = useState<Logo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = useRef<HTMLCanvasElement>(null);

  const previewItem = items.find((i) => i.id === selected) ?? items[0];
  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  // Redraw the downscaled live preview whenever the image or watermark changes.
  useEffect(() => {
    const canvas = preview.current;
    if (!canvas || !previewItem) return;
    let cancelled = false;
    createImageBitmap(previewItem.file).then((bitmap) => {
      if (cancelled) return bitmap.close();
      const k = Math.min(1, PREVIEW_MAX / bitmap.width);
      canvas.width = Math.round(bitmap.width * k);
      canvas.height = Math.round(bitmap.height * k);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      drawWatermark(ctx, canvas.width, canvas.height, settings, logo);
    });
    return () => {
      cancelled = true;
    };
  }, [previewItem, settings, logo]);

  async function chooseLogo(files: File[]) {
    try {
      const bitmap = await createImageBitmap(files[0]);
      logo?.bitmap.close();
      setLogo({ name: files[0].name, bitmap });
      set({ mode: "logo", size: 20 });
    } catch {
      setError("That logo could not be opened. Try a PNG or JPG.");
    }
  }

  const outputName = (item: Item) => `${baseName(item.file.name)}-watermarked.${extensions[item.file.type] ?? "png"}`;

  async function downloadOne(item: Item) {
    try {
      downloadBlob(await render(item.file, settings, logo), outputName(item));
    } catch {
      setError(`Could not process ${item.file.name}.`);
    }
  }

  async function downloadAll() {
    setBusy(true);
    setError("");
    try {
      const entries = await Promise.all(
        items.map(async (item) => ({ name: outputName(item), blob: await render(item.file, settings, logo) })),
      );
      await downloadAsZip(entries, "watermarked-images.zip");
    } catch {
      setError("Some images could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.thumb);
      return prev.filter((p) => p.id !== id);
    });
  }

  const missingMark = settings.mode === "logo" ? !logo : !settings.text.trim();

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/jpeg,image/png,image/webp"
        label="Drop photos here or click to choose"
        hint="JPG, PNG or WebP · add as many as you like"
        onFiles={(files) =>
          setItems((prev) => [...prev, ...files.map((file) => ({ id: uid(), file, thumb: URL.createObjectURL(file) }))])
        }
      />

      <div className="card grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["text", "logo"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set({ mode: m, size: m === "logo" ? 20 : 5 })}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  settings.mode === m ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {m === "text" ? "Text" : "Logo"}
              </button>
            ))}
          </div>

          {settings.mode === "text" ? (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="label" htmlFor="wm-text">Watermark text</label>
                <input id="wm-text" className="field" value={settings.text} onChange={(e) => set({ text: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="wm-color">Color</label>
                <input
                  id="wm-color"
                  type="color"
                  value={settings.color}
                  onChange={(e) => set({ color: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface"
                />
              </div>
            </div>
          ) : (
            <div>
              <span className="label">Logo</span>
              <FileDrop
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                multiple={false}
                label={logo ? `Logo: ${logo.name} — click to replace` : "Choose your logo"}
                hint="Transparent PNG works best"
                onFiles={chooseLogo}
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="wm-size">
              Size: {settings.size}% of image width
            </label>
            <input
              id="wm-size"
              type="range"
              min={settings.mode === "logo" ? 5 : 1}
              max={settings.mode === "logo" ? 60 : 20}
              step={settings.mode === "logo" ? 1 : 0.5}
              value={settings.size}
              onChange={(e) => set({ size: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="label" htmlFor="wm-opacity">
              Opacity: {settings.opacity}%
            </label>
            <input
              id="wm-opacity"
              type="range"
              min={5}
              max={100}
              value={settings.opacity}
              onChange={(e) => set({ opacity: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
        </div>

        <div>
          <span className="label">Position</span>
          <div className="grid w-40 grid-cols-3 gap-1.5" role="radiogroup" aria-label="Position">
            {grid.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={settings.position === p}
                aria-label={positionNames[p]}
                title={positionNames[p]}
                onClick={() => set({ position: p })}
                className={`flex aspect-square items-center justify-center rounded-md border transition ${
                  settings.position === p ? "border-accent bg-accent-soft" : "border-line bg-surface-2 hover:border-accent/50"
                }`}
              >
                <span className={`size-2 rounded-full ${settings.position === p ? "bg-accent" : "bg-muted/50"}`} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => set({ position: "tile" })}
            className={`mt-3 w-40 rounded-lg px-4 py-2 text-sm font-medium transition ${
              settings.position === "tile" ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            Tiled (diagonal)
          </button>
        </div>
      </div>

      {previewItem && (
        <>
          <div className="card p-4">
            <p className="mb-3 text-sm font-medium">Preview · {previewItem.file.name}</p>
            <div className="flex justify-center rounded-xl bg-surface-2 p-3">
              <canvas ref={preview} className="max-h-[60vh] max-w-full rounded-md" aria-label="Watermark preview" />
            </div>
          </div>

          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={`card flex items-center gap-3 p-3 ${item.id === previewItem.id ? "border-accent" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-label={`Preview ${item.file.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                  <img src={item.thumb} alt="" className="size-12 rounded-lg object-cover" />
                  <span className="truncate text-sm font-medium">{item.file.name}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary px-3"
                  disabled={missingMark}
                  onClick={() => downloadOne(item)}
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
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-primary" disabled={busy || missingMark} onClick={downloadAll}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {items.length > 1 ? `Download all as ZIP (${items.length})` : "Download image"}
            </button>
            {missingMark && (
              <span className="text-sm text-muted">
                {settings.mode === "logo" ? "Choose a logo first." : "Enter some watermark text."}
              </span>
            )}
          </div>
        </>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
