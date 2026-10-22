"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

type Sort = "none" | "asc" | "desc";

export default function RemoveDuplicateLines() {
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trim, setTrim] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [sort, setSort] = useState<Sort>("none");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input) return { lines: [] as string[], before: 0 };
    const all = input.split(/\r?\n/);
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const raw of all) {
      const line = trim ? raw.trim() : raw;
      if (removeEmpty && !line.trim()) continue;
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
    }
    if (sort !== "none") {
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
      lines.sort((a, b) => (sort === "asc" ? collator.compare(a, b) : collator.compare(b, a)));
    }
    return { lines, before: all.length };
  }, [input, caseSensitive, trim, removeEmpty, sort]);

  const output = result.lines.join("\n");
  const removed = result.before - result.lines.length;

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Case-sensitive
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
          Trim whitespace
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} />
          Remove empty lines
        </label>
        <label className="flex items-center gap-2">
          Sort
          <select className="field w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="none">Keep order</option>
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card overflow-hidden">
          <p className="border-b border-line bg-surface-2 px-4 py-2.5 text-sm font-medium">Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Paste your list here\none item per line"}
            aria-label="Input lines"
            className="block min-h-80 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-1.5">
            <p className="flex-1 text-sm font-medium">Result</p>
            <button type="button" className="btn-secondary px-3 py-1" disabled={!output} onClick={copy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            aria-label="Lines without duplicates"
            className="block min-h-80 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
      </div>

      {input && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Lines before", value: result.before },
            { label: "Lines after", value: result.lines.length },
            { label: "Removed", value: removed },
          ].map((t) => (
            <div key={t.label} className="card p-4">
              <p className="text-2xl font-bold tabular-nums">{t.value.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted">{t.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
