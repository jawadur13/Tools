"use client";

import { Replace, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

type Options = { caseSensitive: boolean; wholeWord: boolean; regex: boolean };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildRegex(find: string, o: Options): { re: RegExp | null; error: string } {
  if (!find) return { re: null, error: "" };
  let source = o.regex ? find : escapeRegex(find);
  // Unicode-aware word boundaries so whole-word works for Bangla and accented text too.
  if (o.wholeWord) source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`;
  try {
    return { re: new RegExp(source, `g${o.caseSensitive ? "" : "i"}u`), error: "" };
  } catch (e) {
    return { re: null, error: e instanceof Error ? e.message : "Invalid regular expression" };
  }
}

const MAX_HIGHLIGHTS = 2000;

export default function FindAndReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [opts, setOpts] = useState<Options>({ caseSensitive: false, wholeWord: false, regex: false });
  const [history, setHistory] = useState<string[]>([]);
  const [lastCount, setLastCount] = useState<number | null>(null);

  const { re, error } = useMemo(() => buildRegex(find, opts), [find, opts]);
  const matches = useMemo(() => (re ? [...text.matchAll(re)].filter((m) => m[0].length > 0) : []), [re, text]);

  function replaceAll() {
    if (!re || !matches.length) return;
    const result = opts.regex ? text.replace(re, replace) : text.replace(re, () => replace);
    setHistory((h) => [...h.slice(-19), text]);
    setLastCount(matches.length);
    setText(result);
  }

  function undo() {
    if (!history.length) return;
    setText(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setLastCount(null);
  }

  const toggles: { key: keyof Options; label: string }[] = [
    { key: "caseSensitive", label: "Case sensitive" },
    { key: "wholeWord", label: "Whole word" },
    { key: "regex", label: "Regex" },
  ];

  // Build highlighted preview segments.
  const segments: { text: string; hit: boolean }[] = [];
  let pos = 0;
  for (const m of matches.slice(0, MAX_HIGHLIGHTS)) {
    if (m.index > pos) segments.push({ text: text.slice(pos, m.index), hit: false });
    segments.push({ text: m[0], hit: true });
    pos = m.index + m[0].length;
  }
  segments.push({ text: text.slice(pos), hit: false });

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fr-find">Find</label>
          <input id="fr-find" className="field font-mono" value={find} onChange={(e) => setFind(e.target.value)} placeholder={opts.regex ? "e.g. \\d{3}-\\d{4}" : "Text to find"} />
        </div>
        <div>
          <label className="label" htmlFor="fr-replace">Replace with</label>
          <input id="fr-replace" className="field font-mono" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder={opts.regex ? "Use $1, $& for groups" : "Replacement (leave empty to delete)"} />
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          {toggles.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={opts[t.key]} onChange={(e) => setOpts({ ...opts, [t.key]: e.target.checked })} />
              {t.label}
            </label>
          ))}
          <span className="ml-auto text-sm">
            {error ? (
              <span className="text-danger">{error}</span>
            ) : find ? (
              <span className={matches.length ? "font-medium text-accent" : "text-muted"}>
                {matches.length.toLocaleString()} match{matches.length === 1 ? "" : "es"}
              </span>
            ) : null}
          </span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setLastCount(null);
          }}
          placeholder="Paste your text here…"
          aria-label="Text"
          className="block min-h-56 w-full resize-y bg-transparent p-5 text-base leading-relaxed outline-none"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
          <p className="flex-1 text-xs text-muted">
            {lastCount !== null ? (
              <span className="font-medium text-success">Replaced {lastCount.toLocaleString()} occurrence{lastCount === 1 ? "" : "s"}.</span>
            ) : (
              `${text.length.toLocaleString()} characters`
            )}
          </p>
          <button type="button" className="btn-secondary py-1.5" onClick={undo} disabled={!history.length}>
            <Undo2 className="size-4" /> Undo
          </button>
          <CopyButton text={text} className="btn-secondary py-1.5" />
          <button type="button" className="btn-primary py-1.5" onClick={replaceAll} disabled={!matches.length}>
            <Replace className="size-4" /> Replace all
          </button>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="card p-5">
          <p className="mb-3 text-sm font-semibold">
            Matches preview
            {matches.length > MAX_HIGHLIGHTS && (
              <span className="font-normal text-muted"> (first {MAX_HIGHLIGHTS.toLocaleString()} highlighted)</span>
            )}
          </p>
          <div className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-surface-2 p-4 text-sm leading-relaxed">
            {segments.map((s, i) =>
              s.hit ? (
                <mark key={i} className="rounded bg-accent-soft px-0.5 text-accent">
                  {s.text}
                </mark>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
