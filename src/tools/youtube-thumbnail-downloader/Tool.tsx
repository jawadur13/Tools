"use client";

import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { downloadBlob } from "@/lib/files";

const sizes = [
  { name: "maxresdefault", label: "Max resolution", dims: "1280 × 720" },
  { name: "sddefault", label: "Standard", dims: "640 × 480" },
  { name: "hqdefault", label: "High quality", dims: "480 × 360" },
  { name: "mqdefault", label: "Medium quality", dims: "320 × 180" },
];

const ID = /^[\w-]{11}$/;

/** Extracts the 11-character video ID from any common YouTube link, or a bare ID. */
export function parseVideoId(input: string): string | null {
  const value = input.trim();
  if (ID.test(value)) return value;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/")[1];
    return id && ID.test(id) ? id : null;
  }
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  const v = url.searchParams.get("v");
  if (v && ID.test(v)) return v;
  const [, kind, id] = url.pathname.split("/");
  if (["shorts", "embed", "live", "v", "e"].includes(kind) && id && ID.test(id)) return id;
  return null;
}

type Status = "loading" | "ok" | "missing";

export default function YoutubeThumbnailDownloader() {
  const [input, setInput] = useState("");
  // Keyed by "<id>/<size>" so a new video starts fresh without resetting state.
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [downloading, setDownloading] = useState("");
  const [fallbackNote, setFallbackNote] = useState(false);

  const id = parseVideoId(input);
  const statusOf = (name: string): Status => (id ? (status[`${id}/${name}`] ?? "loading") : "loading");
  const mark = (name: string, s: Status) => id && setStatus((prev) => ({ ...prev, [`${id}/${name}`]: s }));
  const urlFor = (name: string) => `https://img.youtube.com/vi/${id}/${name}.jpg`;

  async function download(name: string) {
    if (!id) return;
    setDownloading(name);
    try {
      const res = await fetch(urlFor(name));
      if (!res.ok) throw new Error(String(res.status));
      downloadBlob(await res.blob(), `youtube-${id}-${name}.jpg`);
    } catch {
      // The image host may not allow cross-origin downloads; open it so it can be saved manually.
      window.open(urlFor(name), "_blank", "noopener");
      setFallbackNote(true);
    } finally {
      setDownloading("");
    }
  }

  const available = sizes.filter((s) => statusOf(s.name) === "ok");
  const allChecked = sizes.every((s) => statusOf(s.name) !== "loading");

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <label className="label" htmlFor="yt-url">YouTube video link</label>
        <input
          id="yt-url"
          className="field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… or a Shorts link"
          autoComplete="off"
          spellCheck={false}
        />
        {input.trim() && !id && (
          <p className="mt-2 text-sm text-danger">That doesn&apos;t look like a YouTube link or video ID.</p>
        )}
        {id && (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            Video ID: <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-foreground">{id}</code>
            <CopyButton text={id} label="Copy video ID" iconOnly />
          </p>
        )}
      </div>

      {id && (
        <>
          {!allChecked && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" /> Looking up thumbnails…
            </p>
          )}
          {allChecked && available.length === 0 && (
            <p className="text-sm text-danger">No thumbnails found. The video may be private, deleted or the ID is wrong.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {sizes.map((s) => {
              const state = statusOf(s.name);
              return (
                <div key={`${id}/${s.name}`} className={`card overflow-hidden ${state === "ok" ? "" : "hidden"}`}>
                  <div className="bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail with load checks */}
                    <img
                      src={urlFor(s.name)}
                      alt={`${s.label} thumbnail`}
                      className="aspect-video w-full object-cover"
                      // YouTube serves a 120×90 grey placeholder when a size doesn't exist.
                      onLoad={(e) => mark(s.name, e.currentTarget.naturalWidth > 120 ? "ok" : "missing")}
                      onError={() => mark(s.name, "missing")}
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{s.label}</p>
                      <p className="text-xs text-muted">{s.dims}</p>
                    </div>
                    <a
                      href={urlFor(s.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${s.label} thumbnail in a new tab`}
                      className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <button type="button" className="btn-primary" disabled={downloading === s.name} onClick={() => download(s.name)}>
                      {downloading === s.name ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {fallbackNote && (
            <p className="text-sm text-muted">
              Your browser blocked the direct download, so the image opened in a new tab. Right-click it and choose
              “Save image as…” to keep it.
            </p>
          )}
        </>
      )}
    </div>
  );
}
