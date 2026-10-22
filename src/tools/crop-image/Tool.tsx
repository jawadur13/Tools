"use client";

import { Download, ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob } from "@/lib/files";

type Source = { file: File; url: string; width: number; height: number };
type Rect = { x: number; y: number; w: number; h: number };
type Corner = "nw" | "ne" | "sw" | "se";
type Drag = { kind: "move" | Corner; startX: number; startY: number; start: Rect; scale: number };

const aspects = [
  { id: "free", label: "Free", ratio: 0 },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
];

const MIN = 10;
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Largest rect with the given ratio (0 = free) centered in the image, at 80% size. */
function initialRect(width: number, height: number, ratio: number): Rect {
  let w = width;
  let h = height;
  if (ratio) {
    if (width / height > ratio) w = height * ratio;
    else h = width / ratio;
  }
  w = Math.round(w * 0.8);
  h = Math.round(h * 0.8);
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), w, h };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Resize by dragging one corner while the opposite corner stays fixed. */
function resize(start: Rect, corner: Corner, dx: number, dy: number, ratio: number, W: number, H: number): Rect {
  const left = corner === "nw" || corner === "sw";
  const top = corner === "nw" || corner === "ne";
  const ax = left ? start.x + start.w : start.x;
  const ay = top ? start.y + start.h : start.y;
  const px = clamp((left ? start.x : start.x + start.w) + dx, 0, W);
  const py = clamp((top ? start.y : start.y + start.h) + dy, 0, H);
  let w = Math.max(MIN, Math.abs(px - ax));
  let h = Math.max(MIN, Math.abs(py - ay));

  if (ratio) {
    const maxW = left ? ax : W - ax;
    const maxH = top ? ay : H - ay;
    // Follow whichever axis moved more, then shrink to fit inside the image.
    if (w / ratio >= h) h = w / ratio;
    else w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
  }
  w = Math.round(w);
  h = Math.round(h);
  return { x: left ? ax - w : ax, y: top ? ay - h : ay, w, h };
}

export default function CropImage() {
  const [source, setSource] = useState<Source | null>(null);
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState("free");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  const ratio = aspects.find((a) => a.id === aspect)!.ratio;

  async function load(files: File[]) {
    const file = files[0];
    setError("");
    try {
      const bitmap = await createImageBitmap(file);
      const next = { file, url: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height };
      bitmap.close();
      if (source) URL.revokeObjectURL(source.url);
      setSource(next);
      setRect(initialRect(next.width, next.height, ratio));
    } catch {
      setError("This image could not be opened. Try a JPG, PNG or WebP file.");
    }
  }

  function chooseAspect(id: string) {
    setAspect(id);
    if (source) setRect(initialRect(source.width, source.height, aspects.find((a) => a.id === id)!.ratio));
  }

  function startDrag(kind: Drag["kind"], e: ReactPointerEvent) {
    if (!source || !frame.current) return;
    e.preventDefault();
    e.stopPropagation();
    frame.current.setPointerCapture(e.pointerId);
    const box = frame.current.getBoundingClientRect();
    drag.current = { kind, startX: e.clientX, startY: e.clientY, start: rect, scale: source.width / box.width };
  }

  function onMove(e: ReactPointerEvent) {
    const d = drag.current;
    if (!d || !source) return;
    const dx = (e.clientX - d.startX) * d.scale;
    const dy = (e.clientY - d.startY) * d.scale;
    if (d.kind === "move") {
      setRect({
        ...d.start,
        x: Math.round(clamp(d.start.x + dx, 0, source.width - d.start.w)),
        y: Math.round(clamp(d.start.y + dy, 0, source.height - d.start.h)),
      });
    } else {
      setRect(resize(d.start, d.kind, dx, dy, ratio, source.width, source.height));
    }
  }

  function endDrag() {
    drag.current = null;
  }

  /** Apply a typed value, keeping the rect inside the image (and the ratio, if locked). */
  function setField(field: keyof Rect, raw: number) {
    if (!source || Number.isNaN(raw)) return;
    const next = { ...rect, [field]: Math.round(raw) };
    if (ratio && field === "w") next.h = Math.round(next.w / ratio);
    if (ratio && field === "h") next.w = Math.round(next.h * ratio);
    next.w = clamp(next.w, MIN, source.width);
    next.h = clamp(next.h, MIN, source.height);
    if (ratio && (next.w / next.h).toFixed(2) !== ratio.toFixed(2)) {
      // Clamping broke the ratio; fit back inside.
      if (next.w / ratio > source.height) next.w = Math.round(source.height * ratio);
      next.h = Math.round(next.w / ratio);
    }
    next.x = clamp(next.x, 0, source.width - next.w);
    next.y = clamp(next.y, 0, source.height - next.h);
    setRect(next);
  }

  async function crop() {
    if (!source) return;
    setBusy(true);
    setError("");
    try {
      const bitmap = await createImageBitmap(source.file);
      const canvas = document.createElement("canvas");
      canvas.width = rect.w;
      canvas.height = rect.h;
      const ctx = canvas.getContext("2d")!;
      const type = extensions[source.file.type] ? source.file.type : "image/png";
      if (type === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.w, rect.h);
      }
      ctx.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
      bitmap.close();
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.92));
      if (!blob) throw new Error();
      downloadBlob(blob, `${baseName(source.file.name)}-cropped.${extensions[type]}`);
    } catch {
      setError("Something went wrong while cropping. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!source) {
    return (
      <div className="space-y-3">
        <FileDrop accept="image/jpeg,image/png,image/webp" multiple={false} label="Drop an image here or click to choose" hint="JPG, PNG or WebP" onFiles={load} />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;
  const corners: { id: Corner; className: string }[] = [
    { id: "nw", className: "-left-2 -top-2 cursor-nwse-resize" },
    { id: "ne", className: "-right-2 -top-2 cursor-nesw-resize" },
    { id: "sw", className: "-bottom-2 -left-2 cursor-nesw-resize" },
    { id: "se", className: "-bottom-2 -right-2 cursor-nwse-resize" },
  ];

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium">Aspect ratio</span>
          {aspects.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => chooseAspect(a.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                aspect === a.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center rounded-xl bg-surface-2 p-3">
          <div
            ref={frame}
            className="relative inline-block max-w-full touch-none select-none overflow-hidden"
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
            <img src={source.url} alt="Image to crop" draggable={false} className="block max-h-[60vh] max-w-full" />
            <div
              role="presentation"
              onPointerDown={(e) => startDrag("move", e)}
              className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{
                left: pct(rect.x, source.width),
                top: pct(rect.y, source.height),
                width: pct(rect.w, source.width),
                height: pct(rect.h, source.height),
              }}
            >
              {/* Rule-of-thirds guides */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="border border-white/25" />
                ))}
              </div>
              {corners.map((c) => (
                <span
                  key={c.id}
                  role="presentation"
                  onPointerDown={(e) => startDrag(c.id, e)}
                  className={`absolute size-4 rounded-sm border-2 border-accent bg-white ${c.className}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["x", "y", "w", "h"] as const).map((f) => (
            <div key={f}>
              <label className="label" htmlFor={`crop-${f}`}>
                {{ x: "X", y: "Y", w: "Width", h: "Height" }[f]} (px)
              </label>
              <input
                id={`crop-${f}`}
                type="number"
                min={0}
                className="field"
                value={rect[f]}
                onChange={(e) => setField(f, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          Original: {source.width} × {source.height}px · Crop: {rect.w} × {rect.h}px
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" disabled={busy} onClick={crop}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Crop &amp; download
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            URL.revokeObjectURL(source.url);
            setSource(null);
          }}
        >
          <ImagePlus className="size-4" /> Choose another image
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
