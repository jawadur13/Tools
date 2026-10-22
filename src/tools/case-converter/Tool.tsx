"use client";

import { Check, Copy, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";

/** Split into words on spaces, punctuation and camelCase boundaries. */
function words(text: string): string[] {
  return text
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const conversions: { label: string; fn: (s: string) => string }[] = [
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "Title Case", fn: (s) => s.toLowerCase().replace(/(^|[\s\-(["'“])(\p{L})/gu, (_, p, c) => p + c.toUpperCase()) },
  {
    label: "Sentence case",
    fn: (s) => s.toLowerCase().replace(/(^\s*|[.!?।]\s+)(\p{L})/gu, (_, p, c) => p + c.toUpperCase()),
  },
  {
    label: "camelCase",
    fn: (s) => s.split("\n").map((line) => words(line).map((w, i) => (i ? capitalize(w) : w.toLowerCase())).join("")).join("\n"),
  },
  { label: "PascalCase", fn: (s) => s.split("\n").map((line) => words(line).map(capitalize).join("")).join("\n") },
  { label: "snake_case", fn: (s) => s.split("\n").map((line) => words(line).join("_").toLowerCase()).join("\n") },
  { label: "kebab-case", fn: (s) => s.split("\n").map((line) => words(line).join("-").toLowerCase()).join("\n") },
  {
    label: "aLtErNaTiNg",
    fn: (s) => {
      let i = 0;
      return [...s].map((c) => (/\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join("");
    },
  },
  {
    label: "iNVERSE",
    fn: (s) => [...s].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
  },
];

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function apply(fn: (s: string) => string) {
    const next = fn(text);
    if (next === text) return;
    setHistory((h) => [...h.slice(-19), text]);
    setText(next);
  }

  function undo() {
    if (!history.length) return;
    setText(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {conversions.map((c) => (
          <button
            key={c.label}
            type="button"
            disabled={!text}
            onClick={() => apply(c.fn)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here…"
          className="block min-h-64 w-full resize-y bg-transparent p-5 text-base leading-relaxed outline-none"
          aria-label="Text to convert"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
          <p className="flex-1 text-xs text-muted">
            {text.length.toLocaleString()} characters · {words(text).length.toLocaleString()} words
          </p>
          <button type="button" className="btn-secondary py-1.5" disabled={!history.length} onClick={undo}>
            <Undo2 className="size-4" /> Undo
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={!text} onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            className="btn-secondary py-1.5"
            disabled={!text}
            onClick={() => {
              setHistory((h) => [...h.slice(-19), text]);
              setText("");
            }}
          >
            <Trash2 className="size-4" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
