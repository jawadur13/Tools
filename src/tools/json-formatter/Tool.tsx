"use client";

import { Check, Copy, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { downloadBlob } from "@/lib/files";

type Indent = "2" | "4" | "tab";

const SAMPLE = `{"name":"JR Tools","url":"https://tools.jawadurrafid.com","free":true,"tools":["QR Code Generator","Image Compressor","Merge PDF"],"stats":{"tools":25,"uploads":0}}`;

/** Turns a JSON.parse error into a message with line and column when the engine reports a position. */
function describeError(input: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lineCol = message.match(/line (\d+) column (\d+)/i);
  if (lineCol) {
    const base = message.replace(/\s*\(line \d+ column \d+\)/i, "").replace(/\s*(?:in JSON )?at position \d+$/i, "");
    return `${base} — line ${lineCol[1]}, column ${lineCol[2]}`;
  }
  const pos = message.match(/position (\d+)/i);
  if (pos) {
    const before = input.slice(0, Number(pos[1]));
    const line = before.split("\n").length;
    const column = before.length - before.lastIndexOf("\n");
    return `${message.replace(/\s*(?:at |in JSON at )?position \d+.*$/i, "")} — line ${line}, column ${column}`;
  }
  return message;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<Indent>("2");
  const [copied, setCopied] = useState(false);

  function run(mode: "format" | "minify") {
    setCopied(false);
    if (!input.trim()) {
      setOutput("");
      setError("Paste some JSON first.");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const space = mode === "minify" ? undefined : indent === "tab" ? "\t" : Number(indent);
      setOutput(JSON.stringify(parsed, null, space));
      setError("");
    } catch (e) {
      setOutput("");
      setError(describeError(input, e));
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label" htmlFor="jf-indent">Indentation</label>
          <select id="jf-indent" className="field w-36" value={indent} onChange={(e) => setIndent(e.target.value as Indent)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => run("format")}>
          Format
        </button>
        <button type="button" className="btn-secondary" onClick={() => run("minify")}>
          Minify
        </button>
        <span className="flex-1" />
        <button type="button" className="btn-secondary" onClick={() => setInput(SAMPLE)}>
          Sample
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={!input && !output}
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
        >
          <Trash2 className="size-4" /> Clear
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="label" htmlFor="jf-input">Input</label>
          <textarea
            id="jf-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder='{"paste": "your JSON here"}'
            className="field min-h-96 resize-y font-mono text-[13px] leading-relaxed"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span className="label">Output</span>
            <div className="mb-1.5 flex gap-2">
              <button type="button" className="btn-secondary px-3 py-1" disabled={!output} onClick={copy}>
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1"
                disabled={!output}
                onClick={() => downloadBlob(new Blob([output], { type: "application/json" }), "formatted.json")}
              >
                <Download className="size-4" /> Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            aria-label="Output"
            placeholder="Formatted JSON appears here"
            className="field min-h-96 resize-y bg-surface-2 font-mono text-[13px] leading-relaxed"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span className="font-semibold">Invalid JSON:</span> {error}
        </p>
      )}
      {!error && output && <p className="text-sm text-success">✓ Valid JSON</p>}
    </div>
  );
}
