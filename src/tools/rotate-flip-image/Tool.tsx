"use client";

import { ArrowLeftRight, ArrowUpDown, Download, Loader2, RotateCcw, RotateCw, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { baseName, downloadBlob, uid } from "@/lib/files";
import { downloadAsZip } from "@/lib/zip";

type Item = { id: string; file: File; thumb: string };
type Transform = { rotation: number; flipH: boolean; flipV: boolean };

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const identity: Transform = { rotation: 0, flipH: false, flipV: false };

/** Flip first, then rotate — the same order as the CSS preview transform. */
async function render(file: File, { rotation, flipH, flipV }: Transform): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const sideways = rotation % 180 !== 0;
  const canvas = document.createElement("canvas");
  canvas.width = sideways ? bitmap.height : bitmap.width;
  canvas.height = sideways ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext("2d")!;
  const type = extensions[file.type] ? file.type : "image/png";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.95));
  if (!blob) throw new Error("Could not encode image");
  return blob;
}

export default function RotateFlipImage() {
  const [items, setItems] = useState<Item[]>([]);
  const [t, setT] = useState<Transform>(identity);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const rotate = (deg: number) => setT((p) => ({ ...p, rotation: (p.rotation + deg + 360) % 360 }));
  // Mirroring a sideways image swaps which axis looks "horizontal" to the user.
  const flip = (axis: "h" | "v") =>
    setT((p) => {
      const h = (axis === "h") !== (p.rotation % 180 !== 0);
      return h ? { ...p, flipH: !p.flipH } : { ...p, flipV: !p.flipV };
    });

  const outputName = (item: Item) =>
    `${baseName(item.file.name)}-rotated.${extensions[item.file.type] ?? "png"}`;

  async function download(item: Item) {
    try {
      downloadBlob(await render(item.file, t), outputName(item));
    } catch {
      setError(`Could not process ${item.file.name}.`);
    }
  }

  async function downloadAll() {
    setBusy(true);
    setError("");
    try {
      const entries = await Promise.all(
        items.map(async (item) => ({ name: outputName(item), blob: await render(item.file, t) })),
      );
      await downloadAsZip(entries, "rotated-images.zip");
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

  const transform = `rotate(${t.rotation}deg) scale(${t.flipH ? -1 : 1}, ${t.flipV ? -1 : 1})`;
  const changed = t.rotation !== 0 || t.flipH || t.flipV;
  const controls = [
    { label: "Rotate left", icon: RotateCcw, onClick: () => rotate(-90) },
    { label: "Rotate right", icon: RotateCw, onClick: () => rotate(90) },
    { label: "Flip horizontal", icon: ArrowLeftRight, onClick: () => flip("h") },
    { label: "Flip vertical", icon: ArrowUpDown, onClick: () => flip("v") },
  ];

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/jpeg,image/png,image/webp"
        label="Drop images here or click to choose"
        hint="JPG, PNG or WebP · the same rotation applies to all"
        onFiles={(files) =>
          setItems((prev) => [...prev, ...files.map((file) => ({ id: uid(), file, thumb: URL.createObjectURL(file) }))])
        }
      />

      {items.length > 0 && (
        <>
          <div className="card flex flex-wrap items-center gap-2 p-4">
            {controls.map(({ label, icon: Icon, onClick }) => (
              <button key={label} type="button" className="btn-secondary" onClick={onClick}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
            <button type="button" className="btn-secondary" disabled={!changed} onClick={() => setT(identity)}>
              <Undo2 className="size-4" /> Reset
            </button>
            <span className="ml-auto text-sm text-muted">
              {t.rotation}°{t.flipH ? " · mirrored" : ""}
              {t.flipV ? " · flipped" : ""}
            </span>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="card overflow-hidden">
                <div className="flex aspect-square items-center justify-center bg-surface-2 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL */}
                  <img
                    src={item.thumb}
                    alt={item.file.name}
                    className="max-h-full max-w-full transition-transform duration-200"
                    style={{ transform }}
                  />
                </div>
                <div className="flex items-center gap-2 p-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.file.name}</span>
                  <button
                    type="button"
                    className="btn-secondary px-3"
                    onClick={() => download(item)}
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
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-primary" disabled={busy} onClick={downloadAll}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {items.length > 1 ? `Download all as ZIP (${items.length})` : "Download image"}
            </button>
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
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </>
      )}
    </div>
  );
}
