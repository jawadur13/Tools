"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FileDrop } from "@/components/FileDrop";
import { downloadBlob } from "@/lib/files";
import { downloadAsZip } from "@/lib/zip";
import { buildIco } from "./ico";

type Mode = "image" | "text";
type Settings = {
  mode: Mode;
  text: string;
  fg: string;
  bg: string;
  transparent: boolean;
  radius: number; // % of size
  fit: "cover" | "contain";
};
type Output = { name: string; size: number; blob: Blob; url: string };
type Generated = { key: string; files: Output[] };

const PNGS = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
];
const ICO_SIZES = [16, 32, 48];

const SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

const MANIFEST = JSON.stringify(
  {
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  null,
  2,
);

function renderIcon(size: number, s: Settings, image: ImageBitmap | null): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, (size * s.radius) / 100);
  ctx.clip();
  if (!s.transparent) {
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, size, size);
  }

  if (s.mode === "image" && image) {
    const scale =
      s.fit === "cover"
        ? Math.max(size / image.width, size / image.height)
        : Math.min(size / image.width, size / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
  } else if (s.mode === "text" && s.text.trim()) {
    const text = s.text.trim();
    let font = size * 0.62;
    const family = `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", system-ui, sans-serif`;
    ctx.font = `700 ${font}px ${family}`;
    // Shrink long text so it fits within 84% of the icon.
    const width = ctx.measureText(text).width;
    if (width > size * 0.84) font *= (size * 0.84) / width;
    ctx.font = `700 ${font}px ${family}`;
    ctx.fillStyle = s.fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    // Center the actual glyph box (not the font's line box) vertically.
    const m = ctx.measureText(text);
    ctx.fillText(text, size / 2, size / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
  }
  return canvas;
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/png"));

async function generate(s: Settings, image: ImageBitmap | null): Promise<Output[]> {
  const pngs = await Promise.all(
    PNGS.map(async ({ size, name }) => {
      const blob = await toBlob(renderIcon(size, s, image));
      return { name, size, blob, url: URL.createObjectURL(blob) };
    }),
  );
  const ico = buildIco(
    await Promise.all(
      ICO_SIZES.map(async (size) => ({
        size,
        png: new Uint8Array(await pngs.find((p) => p.size === size)!.blob.arrayBuffer()),
      })),
    ),
  );
  const icoBlob = new Blob([ico as BlobPart], { type: "image/x-icon" });
  return [{ name: "favicon.ico", size: 48, blob: icoBlob, url: URL.createObjectURL(icoBlob) }, ...pngs];
}

export default function FaviconGenerator() {
  const [settings, setSettings] = useState<Settings>({
    mode: "text",
    text: "JR",
    fg: "#ffffff",
    bg: "#5b4cf0",
    transparent: false,
    radius: 22,
    fit: "cover",
  });
  const [image, setImage] = useState<{ name: string; bitmap: ImageBitmap } | null>(null);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  const key = JSON.stringify(settings) + (image?.name ?? "");
  const files = generated?.key === key ? generated.files : null;

  // Regenerate all sizes (debounced) whenever the design changes.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      generate(settings, image?.bitmap ?? null)
        .then((out) => {
          if (cancelled) return out.forEach((f) => URL.revokeObjectURL(f.url));
          setGenerated((prev) => {
            prev?.files.forEach((f) => URL.revokeObjectURL(f.url));
            return { key, files: out };
          });
        })
        .catch(() => !cancelled && setError("Could not generate the icons."));
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [settings, image, key]);

  async function loadImage(list: File[]) {
    setError("");
    try {
      const bitmap = await createImageBitmap(list[0]);
      image?.bitmap.close();
      setImage({ name: list[0].name, bitmap });
      set({ mode: "image", transparent: true, radius: 0 });
    } catch {
      setError("This image could not be opened. Try a PNG, JPG, WebP or SVG.");
    }
  }

  async function downloadAll() {
    if (!files) return;
    setBusy(true);
    try {
      await downloadAsZip(
        [
          ...files.map((f) => ({ name: f.name, blob: f.blob })),
          { name: "site.webmanifest", blob: new Blob([MANIFEST], { type: "application/manifest+json" }) },
        ],
        "favicons.zip",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["text", "image"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set(m === "text" ? { mode: m, transparent: false } : { mode: m })}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  settings.mode === m ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {m === "text" ? "Text / emoji" : "Image"}
              </button>
            ))}
          </div>

          {settings.mode === "text" ? (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="label" htmlFor="fav-text">Letters or emoji</label>
                <input
                  id="fav-text"
                  className="field"
                  maxLength={4}
                  value={settings.text}
                  onChange={(e) => set({ text: e.target.value })}
                  placeholder="e.g. A, JR or 🚀"
                />
              </div>
              <div>
                <label className="label" htmlFor="fav-fg">Text</label>
                <input
                  id="fav-fg"
                  type="color"
                  value={settings.fg}
                  onChange={(e) => set({ fg: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <FileDrop
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                multiple={false}
                label={image ? `${image.name} — click to replace` : "Drop your logo here or click to choose"}
                hint="Square PNG or SVG works best"
                onFiles={loadImage}
              />
              <div className="flex gap-2">
                {(["cover", "contain"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => set({ fit: f })}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      settings.fit === f ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    {f === "cover" ? "Fill square" : "Fit inside"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="label" htmlFor="fav-bg">Background</label>
              <input
                id="fav-bg"
                type="color"
                value={settings.bg}
                disabled={settings.transparent}
                onChange={(e) => set({ bg: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface disabled:opacity-40"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={settings.transparent} onChange={(e) => set({ transparent: e.target.checked })} />
              Transparent background
            </label>
          </div>

          <div>
            <label className="label" htmlFor="fav-radius">
              Corner rounding: {settings.radius}%
            </label>
            <input
              id="fav-radius"
              type="range"
              min={0}
              max={50}
              value={settings.radius}
              onChange={(e) => set({ radius: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-surface-2 p-5">
          {files ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- generated blob URL */}
              <img src={files.find((f) => f.size === 512)!.url} alt="Favicon preview" className="size-36 drop-shadow" />
              <div className="flex w-full max-w-xs items-center gap-2 rounded-t-lg border border-b-0 border-line bg-surface px-3 py-2 text-xs">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated blob URL */}
                <img src={files.find((f) => f.name === "favicon-16x16.png")!.url} alt="" className="size-4" />
                <span className="truncate">Your Website</span>
              </div>
            </>
          ) : (
            <Loader2 className="size-6 animate-spin text-muted" />
          )}
        </div>
      </div>

      {files && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <li key={f.name} className="card flex items-center gap-3 p-3">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated blob URL */}
                  <img src={f.url} alt="" style={{ width: Math.min(f.size, 48), height: Math.min(f.size, 48) }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{f.name}</span>
                  <span className="text-xs text-muted">
                    {f.name.endsWith(".ico") ? "16, 32 & 48 px" : `${f.size}×${f.size}px`}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn-secondary px-3"
                  onClick={() => downloadBlob(f.blob, f.name)}
                  aria-label={`Download ${f.name}`}
                >
                  <Download className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="btn-primary" disabled={busy} onClick={downloadAll}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download all as ZIP
          </button>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Add this to your site&apos;s &lt;head&gt;</p>
              <CopyButton text={SNIPPET} label="Copy HTML" />
            </div>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-2 p-4 font-mono text-xs leading-relaxed">{SNIPPET}</pre>
            <p className="mt-2 text-xs text-muted">The ZIP also includes a site.webmanifest that references the Android icons.</p>
          </div>
        </>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
