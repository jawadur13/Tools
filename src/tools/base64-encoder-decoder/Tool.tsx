"use client";

import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { formatBytes } from "@/lib/files";

type Mode = "encode" | "decode";

function encode(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

function decode(input: string): string {
  // Accept both standard and URL-safe alphabets, with or without padding.
  let b64 = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error("The input contains characters that are not valid Base64.");
  b64 = b64.replace(/=+$/, "");
  if (b64.length % 4 === 1) throw new Error("The input length is not valid Base64.");
  b64 += "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  return {
    copied,
    copy: async (key: string, text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    },
  };
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [file, setFile] = useState<{ name: string; size: number; dataUrl: string } | null>(null);
  const { copied, copy } = useCopy();

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: mode === "encode" ? encode(input, urlSafe) : decode(input), error: "" };
    } catch (e) {
      const error =
        e instanceof TypeError
          ? "The decoded bytes are not valid UTF-8 text (this may be binary data such as an image)."
          : e instanceof Error
            ? e.message
            : "Invalid input.";
      return { output: "", error };
    }
  }, [input, mode, urlSafe]);

  function swap() {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(result.output);
  }

  function readFile(files: File[]) {
    const f = files[0];
    const reader = new FileReader();
    reader.onload = () => setFile({ name: f.name, size: f.size, dataUrl: String(reader.result) });
    reader.readAsDataURL(f);
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                mode === m ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
          {mode === "encode" && (
            <label className="ml-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} />
              URL-safe
            </label>
          )}
        </div>

        <div>
          <label className="label" htmlFor="b64-in">{mode === "encode" ? "Text" : "Base64"}</label>
          <textarea
            id="b64-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === "encode" ? "Type or paste text to encode" : "Paste Base64 to decode"}
            className="field min-h-36 resize-y font-mono text-[13px]"
          />
        </div>

        <div className="flex justify-center">
          <button type="button" className="btn-secondary" onClick={swap} disabled={!result.output}>
            <ArrowLeftRight className="size-4" /> Swap
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="label">{mode === "encode" ? "Base64" : "Text"}</span>
            <button
              type="button"
              className="btn-secondary mb-1.5 px-3 py-1"
              disabled={!result.output}
              onClick={() => copy("out", result.output)}
            >
              {copied === "out" ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              {copied === "out" ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={result.output}
            aria-label="Result"
            className="field min-h-36 resize-y break-all bg-surface-2 font-mono text-[13px]"
          />
          {result.error && <p className="mt-2 text-sm text-danger">{result.error}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">File to Base64</h2>
        <FileDrop
          accept="*/*"
          multiple={false} label="Drop a file to get its Base64 data URL" hint="Images, fonts, PDFs — any file" onFiles={readFile} />
        {file && (
          <div className="card space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">{file.name}</span>{" "}
                <span className="text-muted">
                  · {formatBytes(file.size)} → {formatBytes(file.dataUrl.length)} encoded
                </span>
              </p>
              <button type="button" className="btn-primary px-3 py-1.5" onClick={() => copy("file", file.dataUrl)}>
                {copied === "file" ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === "file" ? "Copied" : "Copy data URL"}
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5"
                onClick={() => copy("raw", file.dataUrl.slice(file.dataUrl.indexOf(",") + 1))}
              >
                {copied === "raw" ? "Copied" : "Copy Base64 only"}
              </button>
            </div>
            <textarea
              readOnly
              value={file.dataUrl.length > 20000 ? `${file.dataUrl.slice(0, 20000)}…` : file.dataUrl}
              aria-label="Data URL"
              className="field h-28 resize-y break-all bg-surface-2 font-mono text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
