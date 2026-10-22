"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { formatBytes } from "@/lib/files";
import { md5 } from "./md5";

type Mode = "text" | "file";
type Hashes = Record<string, string>;

const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");

async function hashAll(bytes: Uint8Array<ArrayBuffer>): Promise<Hashes> {
  const result: Hashes = { MD5: md5(bytes) };
  for (const algo of ALGORITHMS.slice(1)) {
    result[algo] = toHex(await crypto.subtle.digest(algo, bytes));
  }
  return result;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy hash"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
    </button>
  );
}

export default function HashGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{ key: string; values: Hashes } | null>(null);
  const [uppercase, setUppercase] = useState(false);
  const [compare, setCompare] = useState("");

  const source = mode === "text" ? text : file;
  const sourceKey = mode === "text" ? `t:${text}` : file ? `f:${file.name}:${file.size}:${file.lastModified}` : "";

  useEffect(() => {
    if (source === null) return;
    let cancelled = false;
    const bytesPromise =
      typeof source === "string"
        ? Promise.resolve(new TextEncoder().encode(source))
        : source.arrayBuffer().then((b) => new Uint8Array(b));
    bytesPromise
      .then(hashAll)
      .then((values) => !cancelled && setHashes({ key: sourceKey, values }));
    return () => {
      cancelled = true;
    };
  }, [source, sourceKey]);

  // Only show results that belong to the current input.
  const current = hashes && hashes.key === sourceKey ? hashes.values : null;
  const needle = compare.trim().toLowerCase();

  return (
    <div className="space-y-5">
      <div className="card space-y-4 p-5">
        <div className="flex gap-2">
          {(["text", "file"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mode === m ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {m === "text" ? "Text" : "File"}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to hash…"
            className="field min-h-32 font-mono"
            aria-label="Text to hash"
          />
        ) : (
          <>
            {/* An accept value of any type lets FileDrop take every file. */}
            <FileDrop accept="*/*" multiple={false} label="Drop a file here or click to choose" hint="Any file type" onFiles={([f]) => setFile(f)} />
            {file && (
              <p className="text-sm text-muted">
                <span className="font-medium text-foreground">{file.name}</span> · {formatBytes(file.size)}
              </p>
            )}
          </>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
          Uppercase output
        </label>
      </div>

      <div className="card divide-y divide-line">
        {ALGORITHMS.map((algo) => {
          const value = current?.[algo] ?? "";
          const shown = uppercase ? value.toUpperCase() : value;
          const match = needle && value === needle;
          return (
            <div key={algo} className={`flex items-center gap-3 p-4 ${match ? "bg-success/10" : ""}`}>
              <span className="w-20 shrink-0 text-sm font-semibold">{algo}</span>
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-muted">
                {shown || (source === null ? "—" : "…")}
              </code>
              {match && <Check className="size-4 shrink-0 text-success" aria-label="Matches" />}
              {value && <CopyButton value={shown} />}
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <label className="label" htmlFor="hash-compare">Compare with a checksum</label>
        <input
          id="hash-compare"
          value={compare}
          onChange={(e) => setCompare(e.target.value)}
          placeholder="Paste the expected hash"
          className="field font-mono"
        />
        {needle && current && (
          <p className={`mt-2 text-sm font-medium ${Object.values(current).includes(needle) ? "text-success" : "text-danger"}`}>
            {Object.values(current).includes(needle)
              ? `Match — ${ALGORITHMS.find((a) => current[a] === needle)} hash is identical.`
              : "No match with any of the hashes above."}
          </p>
        )}
      </div>
    </div>
  );
}
