"use client";

import { Copy, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const STOP_WORDS = new Set(
  "a an and are as at be but by for from has have i in is it its of on or that the this to was were will with you your we our they".split(" "),
);

function analyze(text: string) {
  const words = text.match(/[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*/gu) ?? [];
  const graphemes = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)];
  const characters = graphemes.length;
  const noSpaces = graphemes.filter((g) => !/\s/.test(g.segment)).length;
  const sentences = text.split(/[.!?।]+(?:\s|$)/u).filter((s) => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;

  const freq = new Map<string, number>();
  for (const w of words) {
    const key = w.toLowerCase();
    if (key.length < 3 || STOP_WORDS.has(key)) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const keywords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return {
    words: words.length,
    characters,
    noSpaces,
    sentences,
    paragraphs,
    readingMin: words.length / 225,
    speakingMin: words.length / 140,
    keywords,
  };
}

function formatMinutes(min: number) {
  if (min === 0) return "0 sec";
  if (min < 1) return `${Math.max(1, Math.round(min * 60))} sec`;
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s ? `${m} min ${s} sec` : `${m} min`;
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => analyze(text), [text]);

  const tiles = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.characters },
    { label: "Without spaces", value: stats.noSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Reading time", value: formatMinutes(stats.readingMin) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4">
            <p className="text-2xl font-bold tabular-nums">{t.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here…"
          className="block min-h-72 w-full resize-y bg-transparent p-5 text-base leading-relaxed outline-none"
          aria-label="Text to count"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
          <p className="flex-1 text-xs text-muted">Speaking time: {formatMinutes(stats.speakingMin)}</p>
          <button type="button" className="btn-secondary py-1.5" disabled={!text} onClick={() => navigator.clipboard.writeText(text)}>
            <Copy className="size-4" /> Copy
          </button>
          <button type="button" className="btn-secondary py-1.5" disabled={!text} onClick={() => setText("")}>
            <Trash2 className="size-4" /> Clear
          </button>
        </div>
      </div>

      {stats.keywords.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold">Top keywords</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.keywords.map(([word, count]) => (
              <span key={word} className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">
                {word} <span className="font-semibold">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
