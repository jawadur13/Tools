"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

const FLAGS = [
  { flag: "g", title: "Global — find all matches" },
  { flag: "i", title: "Ignore case" },
  { flag: "m", title: "Multiline — ^ and $ match at line breaks" },
  { flag: "s", title: "Dot all — . matches newlines" },
  { flag: "u", title: "Unicode" },
  { flag: "y", title: "Sticky — match from lastIndex only" },
];

const CHEATSHEET: [string, string][] = [
  [".", "Any character except newline"],
  ["\\d \\D", "Digit / non-digit"],
  ["\\w \\W", "Word character / non-word"],
  ["\\s \\S", "Whitespace / non-whitespace"],
  ["\\b", "Word boundary"],
  ["^ $", "Start / end of string (or line with m)"],
  ["[abc] [^abc]", "Any of / none of a, b, c"],
  ["a* a+ a?", "0 or more / 1 or more / 0 or 1"],
  ["a{2,5}", "Between 2 and 5 times"],
  ["a*?", "Lazy (as few as possible)"],
  ["(abc)", "Capture group"],
  ["(?<name>abc)", "Named capture group"],
  ["(?:abc)", "Non-capturing group"],
  ["a|b", "a or b"],
  ["(?=a) (?!a)", "Lookahead / negative lookahead"],
  ["(?<=a) (?<!a)", "Lookbehind / negative lookbehind"],
];

const MAX_MATCHES = 1000;

type Match = { text: string; index: number; groups: string[]; named: Record<string, string | undefined> };

function run(pattern: string, flags: string, input: string): { matches: Match[]; error: string; truncated: boolean } {
  if (!pattern) return { matches: [], error: "", truncated: false };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : "Invalid pattern", truncated: false };
  }
  const matches: Match[] = [];
  const toMatch = (m: RegExpExecArray): Match => ({
    text: m[0],
    index: m.index,
    groups: m.slice(1),
    named: { ...(m.groups ?? {}) },
  });

  if (!re.global && !re.sticky) {
    const m = re.exec(input);
    return { matches: m ? [toMatch(m)] : [], error: "", truncated: false };
  }

  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null) {
    matches.push(toMatch(m));
    // Zero-length matches would loop forever; step past them manually.
    if (m[0] === "") re.lastIndex += re.unicode ? (input.codePointAt(re.lastIndex)! > 0xffff ? 2 : 1) : 1;
    if (!re.global) break;
    if (matches.length >= MAX_MATCHES) return { matches, error: "", truncated: true };
  }
  return { matches, error: "", truncated: false };
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("(?<user>[\\w.+-]+)@(?<domain>[\\w-]+\\.[\\w.]+)");
  const [flags, setFlags] = useState("g");
  const [input, setInput] = useState("Contact us at hello@example.com or support@jawadurrafid.com.\nInvalid: user@ and @domain.com");
  const [replacement, setReplacement] = useState("");

  const { matches, error, truncated } = useMemo(() => run(pattern, flags, input), [pattern, flags, input]);

  const replaced = useMemo(() => {
    if (!replacement || error || !pattern) return "";
    try {
      return input.replace(new RegExp(pattern, flags), replacement);
    } catch {
      return "";
    }
  }, [replacement, error, pattern, flags, input]);

  const toggle = (f: string) =>
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : FLAGS.map((x) => x.flag).filter((x) => cur.includes(x) || x === f).join("")));

  const segments: { text: string; hit: number | null }[] = [];
  let pos = 0;
  matches.forEach((m, i) => {
    if (m.text === "" || m.index < pos) return;
    if (m.index > pos) segments.push({ text: input.slice(pos, m.index), hit: null });
    segments.push({ text: m.text, hit: i });
    pos = m.index + m.text.length;
  });
  segments.push({ text: input.slice(pos), hit: null });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-5">
        <div className="card space-y-4 p-5">
          <div>
            <label className="label" htmlFor="rx-pattern">Regular expression</label>
            <div className="flex items-center rounded-lg border border-line bg-surface font-mono text-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
              <span className="pl-3 text-muted">/</span>
              <input
                id="rx-pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 outline-none"
              />
              <span className="pr-3 text-muted">/{flags}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FLAGS.map(({ flag, title }) => (
              <button
                key={flag}
                type="button"
                title={title}
                aria-pressed={flags.includes(flag)}
                onClick={() => toggle(flag)}
                className={`w-9 rounded-lg py-1.5 font-mono text-sm font-medium transition ${
                  flags.includes(flag) ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {flag}
              </button>
            ))}
            <span className="ml-auto text-sm">
              {error ? (
                <span className="text-danger">{error}</span>
              ) : pattern ? (
                <span className={matches.length ? "font-medium text-accent" : "text-muted"}>
                  {matches.length}
                  {truncated ? "+" : ""} match{matches.length === 1 ? "" : "es"}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="card overflow-hidden">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Test string</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            aria-label="Test string"
            className="block min-h-36 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
          {pattern && !error && (
            <div className="whitespace-pre-wrap break-words border-t border-line bg-surface-2 p-4 font-mono text-sm leading-relaxed">
              {segments.map((s, i) =>
                s.hit === null ? (
                  <span key={i}>{s.text}</span>
                ) : (
                  <mark key={i} className={`rounded px-0.5 ${s.hit % 2 ? "bg-success/20 text-success" : "bg-accent-soft text-accent"}`}>
                    {s.text}
                  </mark>
                ),
              )}
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div className="card overflow-hidden">
            <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Matches</p>
            <ol className="max-h-96 divide-y divide-line overflow-auto">
              {matches.slice(0, 200).map((m, i) => (
                <li key={i} className="space-y-1 px-4 py-3 font-mono text-sm">
                  <p>
                    <span className="text-muted">#{i + 1}</span> <span className="text-accent">“{m.text}”</span>{" "}
                    <span className="text-xs text-muted">
                      index {m.index}–{m.index + m.text.length}
                    </span>
                  </p>
                  {m.groups.map((g, gi) => (
                    <p key={gi} className="pl-4 text-xs">
                      <span className="text-muted">${gi + 1}</span> {g === undefined ? <em className="text-muted">undefined</em> : `“${g}”`}
                    </p>
                  ))}
                  {Object.entries(m.named).map(([name, value]) => (
                    <p key={name} className="pl-4 text-xs">
                      <span className="text-muted">{name}:</span> {value === undefined ? <em className="text-muted">undefined</em> : `“${value}”`}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="card space-y-3 p-5">
          <label className="label" htmlFor="rx-replace">Replace with (optional)</label>
          <input
            id="rx-replace"
            className="field font-mono"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="e.g. $<user> at $<domain>"
          />
          {replaced && (
            <>
              <pre className="whitespace-pre-wrap break-words rounded-lg bg-surface-2 p-4 font-mono text-sm">{replaced}</pre>
              <CopyButton text={replaced} label="Copy result" />
            </>
          )}
        </div>
      </div>

      <aside className="card h-fit p-5">
        <p className="text-sm font-semibold">Cheat sheet</p>
        <dl className="mt-3 space-y-2 text-sm">
          {CHEATSHEET.map(([token, desc]) => (
            <div key={token} className="flex gap-3">
              <dt className="w-24 shrink-0 font-mono text-accent">{token}</dt>
              <dd className="text-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
