"use client";

import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "encode" | "decode";
type Scope = "component" | "full";

function convert(input: string, mode: Mode, scope: Scope): string {
  if (mode === "encode") return scope === "component" ? encodeURIComponent(input) : encodeURI(input);
  const text = input.replace(/\+/g, " ");
  return scope === "component" ? decodeURIComponent(text) : decodeURI(text);
}

export default function UrlEncoderDecoder() {
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: convert(input, mode, scope), error: "" };
    } catch {
      return {
        output: "",
        error: "Malformed input: every % must be followed by two hex digits that form valid UTF-8 (e.g. %20 or %E0%A6%AC).",
      };
    }
  }, [input, mode, scope]);

  async function copy() {
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
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
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="url-scope" checked={scope === "component"} onChange={() => setScope("component")} />
            Component
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="url-scope" checked={scope === "full"} onChange={() => setScope("full")} />
            Full URL
          </label>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="url-in">Input</label>
        <textarea
          id="url-in"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder={mode === "encode" ? "https://example.com/search?q=hello world" : "https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world"}
          className="field min-h-32 resize-y font-mono text-[13px]"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="btn-secondary"
          disabled={!result.output}
          onClick={() => {
            setMode(mode === "encode" ? "decode" : "encode");
            setInput(result.output);
          }}
        >
          <ArrowLeftRight className="size-4" /> Swap
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="label">Result</span>
          <button type="button" className="btn-secondary mb-1.5 px-3 py-1" disabled={!result.output} onClick={copy}>
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <textarea
          readOnly
          value={result.output}
          aria-label="Result"
          className="field min-h-32 resize-y break-all bg-surface-2 font-mono text-[13px]"
        />
        {result.error && <p className="mt-2 text-sm text-danger">{result.error}</p>}
      </div>
    </div>
  );
}
