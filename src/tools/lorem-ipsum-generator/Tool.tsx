"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

type Unit = "paragraphs" | "sentences" | "words";

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore " +
  "magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat " +
  "duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat " +
  "cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt " +
  "lacus nulla gravida orci a odio nullam varius turpis morbi mattis faucibus mauris integer vitae justo eget " +
  "vulputate porta pellentesque habitant tristique senectus netus malesuada fames ac egestas vestibulum ante " +
  "primis augue mauris augue neque gravida fermentum donec ultrices nunc sapien facilisis volutpat blandit"
).split(" ");

const OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

/** Small seeded PRNG so "Regenerate" gives new text but renders are stable. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(unit: Unit, count: number, classic: boolean, seed: number): string[] {
  const rand = mulberry32(seed);
  const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const word = () => WORDS[Math.floor(rand() * WORDS.length)];

  const sentence = () => {
    const parts = Array.from({ length: between(6, 14) }, word);
    if (parts.length > 8 && rand() < 0.5) parts[between(3, parts.length - 3)] += ",";
    const s = parts.join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  };
  const paragraph = () => Array.from({ length: between(4, 7) }, sentence).join(" ");

  if (unit === "words") {
    const list = Array.from({ length: count }, word);
    if (classic) OPENING.toLowerCase().replace(",", "").split(" ").slice(0, count).forEach((w, i) => (list[i] = w));
    const s = list.join(" ");
    return [s.charAt(0).toUpperCase() + s.slice(1) + "."];
  }

  if (unit === "sentences") {
    const list = Array.from({ length: count }, sentence);
    if (classic) list[0] = `${OPENING}.`;
    return [list.join(" ")];
  }

  const list = Array.from({ length: count }, paragraph);
  if (classic) list[0] = `${OPENING}. ${list[0]}`;
  return list;
}

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<Unit>("paragraphs");
  const [count, setCount] = useState(3);
  const [classic, setClassic] = useState(true);
  const [html, setHtml] = useState(false);
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState(false);

  const max = unit === "paragraphs" ? 50 : unit === "sentences" ? 200 : 2000;
  const safeCount = Math.min(Math.max(1, count || 1), max);

  const output = useMemo(() => {
    const blocks = generate(unit, safeCount, classic, seed);
    return html ? blocks.map((b) => `<p>${b}</p>`).join("\n\n") : blocks.join("\n\n");
  }, [unit, safeCount, classic, seed, html]);

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="card grid gap-5 p-5 sm:grid-cols-[1fr_140px_auto] sm:items-end">
        <div>
          <p className="label">Generate</p>
          <div className="flex flex-wrap gap-2">
            {(["paragraphs", "sentences", "words"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                  unit === u ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="li-count">How many</label>
          <input
            id="li-count"
            type="number"
            min={1}
            max={max}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field"
          />
        </div>
        <button type="button" className="btn-secondary" onClick={() => setSeed((s) => s + 1)}>
          <RefreshCw className="size-4" /> Regenerate
        </button>
        <div className="flex flex-wrap gap-5 text-sm sm:col-span-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={classic} onChange={(e) => setClassic(e.target.checked)} />
            Start with “Lorem ipsum dolor sit amet”
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={html} onChange={(e) => setHtml(e.target.checked)} />
            Wrap in HTML &lt;p&gt; tags
          </label>
        </div>
      </div>

      <div className="card overflow-hidden">
        <textarea
          readOnly
          value={output}
          aria-label="Generated lorem ipsum"
          className={`block min-h-72 w-full resize-y bg-transparent p-5 leading-relaxed outline-none ${html ? "font-mono text-sm" : "text-base"}`}
        />
        <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
          <p className="flex-1 text-xs text-muted">
            {output.split(/\s+/).filter(Boolean).length.toLocaleString()} words · {output.length.toLocaleString()} characters
          </p>
          <button type="button" className="btn-primary py-1.5" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
