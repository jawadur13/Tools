"use client";

import { Download, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { FileList } from "@/components/FileList";
import { downloadBlob, formatBytes, moveItem, uid } from "@/lib/files";

type Item = { id: string; file: File; thumb: string };
type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";

// Page sizes in PDF points (1/72 inch).
const sizes = { a4: [595.28, 841.89], letter: [612, 792] } as const;
const margins = { none: 0, small: 18, large: 40 } as const;

/** pdf-lib only embeds JPG and PNG, so other formats are converted to PNG first. */
async function toEmbeddable(file: File): Promise<{ bytes: ArrayBuffer; type: "jpg" | "png" }> {
  if (file.type === "image/jpeg") return { bytes: await file.arrayBuffer(), type: "jpg" };
  if (file.type === "image/png") return { bytes: await file.arrayBuffer(), type: "png" };
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("Could not convert image");
  return { bytes: await blob.arrayBuffer(), type: "png" };
}

export default function JpgToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<keyof typeof margins>("small");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Blob | null>(null);

  function update<T>(setter: (v: T) => void) {
    return (v: T) => {
      setResult(null);
      setter(v);
    };
  }

  async function create() {
    setBusy(true);
    setError("");
    try {
      const pdf = await PDFDocument.create();
      for (const item of items) {
        const { bytes, type } = await toEmbeddable(item.file);
        const image = type === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);

        if (pageSize === "fit") {
          pdf.addPage([image.width, image.height]).drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
          continue;
        }

        const [w, h] = sizes[pageSize];
        const [pw, ph] = orientation === "portrait" ? [w, h] : [h, w];
        const m = margins[margin];
        const scale = Math.min((pw - 2 * m) / image.width, (ph - 2 * m) / image.height, 1);
        const iw = image.width * scale;
        const ih = image.height * scale;
        pdf.addPage([pw, ph]).drawImage(image, { x: (pw - iw) / 2, y: (ph - ih) / 2, width: iw, height: ih });
      }
      const bytes = await pdf.save();
      setResult(new Blob([bytes as BlobPart], { type: "application/pdf" }));
    } catch {
      setError("Something went wrong while creating the PDF. Please try different images.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <FileDrop
        accept="image/jpeg,image/png,image/webp"
        label="Drop images here or click to choose"
        hint="JPG, PNG or WebP · each image becomes a page"
        onFiles={(files) => {
          setResult(null);
          setItems((prev) => [...prev, ...files.map((file) => ({ id: uid(), file, thumb: URL.createObjectURL(file) }))]);
        }}
      />

      <div className="card grid gap-5 p-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="jp-size">Page size</label>
          <select id="jp-size" className="field" value={pageSize} onChange={(e) => update(setPageSize)(e.target.value as PageSize)}>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
            <option value="fit">Fit to image</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="jp-orient">Orientation</label>
          <select
            id="jp-orient"
            className="field"
            value={orientation}
            disabled={pageSize === "fit"}
            onChange={(e) => update(setOrientation)(e.target.value as Orientation)}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="jp-margin">Margin</label>
          <select
            id="jp-margin"
            className="field"
            value={margin}
            disabled={pageSize === "fit"}
            onChange={(e) => update(setMargin)(e.target.value as keyof typeof margins)}
          >
            <option value="none">No margin</option>
            <option value="small">Small</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <FileList
            items={items.map((i) => ({ id: i.id, name: i.file.name, detail: formatBytes(i.file.size), thumb: i.thumb }))}
            onMove={(from, to) => {
              setResult(null);
              setItems((prev) => moveItem(prev, from, to));
            }}
            onRemove={(id) => {
              setResult(null);
              setItems((prev) => {
                const item = prev.find((p) => p.id === id);
                if (item) URL.revokeObjectURL(item.thumb);
                return prev.filter((p) => p.id !== id);
              });
            }}
          />
          <div className="card flex flex-wrap items-center gap-4 p-5">
            <p className="flex-1 text-sm text-muted">
              {items.length} page{items.length === 1 ? "" : "s"}
            </p>
            {result ? (
              <button type="button" className="btn-primary" onClick={() => downloadBlob(result, "images.pdf")}>
                <Download className="size-4" /> Download PDF ({formatBytes(result.size)})
              </button>
            ) : (
              <button type="button" className="btn-primary" disabled={busy} onClick={create}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                {busy ? "Creating…" : "Create PDF"}
              </button>
            )}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </>
      )}
    </div>
  );
}
