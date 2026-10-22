"use client";

import { diffChars, diffLines, diffWordsWithSpace } from "diff";
import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "lines" | "words" | "chars";

const modes: { id: Mode; label: string }[] = [
  { id: "lines", label: "Lines" },
  { id: "words", label: "Words" },
  { id: "chars", label: "Characters" },
];

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [mode, setMode] = useState<Mode>("words");

  const parts = useMemo(() => {
    if (!original && !changed) return [];
    if (mode === "lines") return diffLines(original, changed);
    if (mode === "words") return diffWordsWithSpace(original, changed);
    return diffChars(original, changed);
  }, [original, changed, mode]);

  // Count changed units in the chosen mode, not raw diff chunks.
  const unitCount = (value: string) =>
    mode === "lines"
      ? value.split("\n").filter((l, i, arr) => l || i < arr.length - 1).length
      : mode === "words"
        ? value.split(/\s+/).filter(Boolean).length
        : [...value].length;
  const added = parts.filter((p) => p.added).reduce((s, p) => s + unitCount(p.value), 0);
  const removed = parts.filter((p) => p.removed).reduce((s, p) => s + unitCount(p.value), 0);
  const identical = parts.length > 0 && added === 0 && removed === 0;
  const unitLabel = mode === "lines" ? "lines" : mode === "words" ? "words" : "characters";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Original text", value: original, set: setOriginal },
          { label: "Changed text", value: changed, set: setChanged },
        ].map((box) => (
          <div key={box.label} className="card overflow-hidden">
            <p className="border-b border-line bg-surface-2 px-4 py-2.5 text-sm font-medium">{box.label}</p>
            <textarea
              value={box.value}
              onChange={(e) => box.set(e.target.value)}
              placeholder={`Paste the ${box.label.toLowerCase()} here…`}
              aria-label={box.label}
              className="block min-h-56 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === m.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          className="btn-secondary ml-auto py-2"
          disabled={!original && !changed}
          onClick={() => {
            setOriginal(changed);
            setChanged(original);
          }}
        >
          <ArrowLeftRight className="size-4" /> Swap
        </button>
      </div>

      {parts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 border-b border-line bg-surface-2 px-4 py-2.5 text-sm">
            <p className="flex-1 font-medium">Differences</p>
            {identical ? (
              <span className="text-success">The texts are identical</span>
            ) : (
              <>
                <span className="font-medium text-success">
                  +{added.toLocaleString()} {unitLabel} added
                </span>
                <span className="font-medium text-danger">
                  −{removed.toLocaleString()} {unitLabel} removed
                </span>
              </>
            )}
          </div>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed">
            {parts.map((p, i) =>
              p.added ? (
                <ins key={i} className="rounded-sm bg-success/15 text-success no-underline">
                  {p.value}
                </ins>
              ) : p.removed ? (
                <del key={i} className="rounded-sm bg-danger/15 text-danger">
                  {p.value}
                </del>
              ) : (
                <span key={i}>{p.value}</span>
              ),
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
