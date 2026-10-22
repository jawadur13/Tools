"use client";

import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { downloadBlob } from "@/lib/files";

type Format = { uppercase: boolean; noHyphens: boolean; quotes: boolean };

const makeBatch = (count: number) => Array.from({ length: count }, () => crypto.randomUUID());

function formatUuid(id: string, f: Format): string {
  let out = f.noHyphens ? id.replace(/-/g, "") : id;
  if (f.uppercase) out = out.toUpperCase();
  return f.quotes ? `"${out}"` : out;
}

export default function UuidGenerator() {
  const [count, setCount] = useState(10);
  const [ids, setIds] = useState<string[]>(() => makeBatch(10));
  const [format, setFormat] = useState<Format>({ uppercase: false, noHyphens: false, quotes: false });
  const [copied, setCopied] = useState<number | "all" | null>(null);

  const lines = ids.map((id) => formatUuid(id, format));

  async function copy(key: number | "all", text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const toggles: { key: keyof Format; label: string }[] = [
    { key: "uppercase", label: "Uppercase" },
    { key: "noHyphens", label: "No hyphens" },
    { key: "quotes", label: "Wrap in quotes" },
  ];

  return (
    <div className="card space-y-5 p-5 sm:p-8">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="uuid-count">How many (1–500)</label>
          <input
            id="uuid-count"
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Math.min(500, Math.max(1, Number(e.target.value) || 1)))}
            className="field w-28"
          />
        </div>
        <button type="button" className="btn-primary" onClick={() => setIds(makeBatch(count))}>
          <RefreshCw className="size-4" /> Generate
        </button>
        <div className="flex flex-wrap gap-4 pb-2.5 text-sm">
          {toggles.map((t) => (
            <label key={t.key} className="flex items-center gap-2">
              <input type="checkbox" checked={format[t.key]} onChange={(e) => setFormat({ ...format, [t.key]: e.target.checked })} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <p className="flex-1 text-sm text-muted">
          {ids.length} UUID{ids.length === 1 ? "" : "s"} (version 4)
        </p>
        <button type="button" className="btn-secondary" onClick={() => copy("all", lines.join("\n"))}>
          {copied === "all" ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          {copied === "all" ? "Copied" : "Copy all"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => downloadBlob(new Blob([lines.join("\n") + "\n"], { type: "text/plain" }), "uuids.txt")}
        >
          <Download className="size-4" /> Download .txt
        </button>
      </div>

      <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto">
        {lines.map((line, i) => (
          <li key={ids[i]} className="flex items-center gap-2 rounded-lg bg-surface-2 py-1.5 pl-4 pr-1.5">
            <code className="min-w-0 flex-1 truncate font-mono text-sm">{line}</code>
            <button
              type="button"
              onClick={() => copy(i, line)}
              aria-label="Copy UUID"
              className="rounded-md p-2 text-muted hover:bg-surface hover:text-foreground"
            >
              {copied === i ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
