"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { fromDateTimeLocal, parseTimestamp, relativeTime, toDateTimeLocal, toRfc2822 } from "./time";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
      <span className="w-28 shrink-0 text-sm font-medium text-muted">{label}</span>
      <span className="min-w-0 flex-1 break-all font-mono text-sm">{value}</span>
      <CopyButton text={value} label={`Copy ${label}`} iconOnly />
    </div>
  );
}

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export default function TimestampConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(() => toDateTimeLocal(new Date()));
  const [asUtc, setAsUtc] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parsed = parseTimestamp(input);
  const date = parsed ? new Date(parsed.ms) : null;
  const fromDate = fromDateTimeLocal(dateInput, asUtc);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Current Unix timestamp</p>
          <p className="mt-1 font-mono text-3xl font-bold tabular-nums">{Math.floor(now / 1000)}</p>
          <p className="mt-0.5 font-mono text-sm text-muted tabular-nums">{now} ms</p>
        </div>
        <div className="flex gap-2">
          <CopyButton text={String(Math.floor(now / 1000))} label="Copy seconds" />
          <CopyButton text={String(now)} label="Copy ms" />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Timestamp → date</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            aria-label="Unix timestamp"
            className="field max-w-sm flex-1 font-mono"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1767225600"
          />
          <button type="button" className="btn-secondary" onClick={() => setInput(String(Math.floor(now / 1000)))}>
            Now
          </button>
        </div>
        {input.trim() && !parsed && <p className="mt-2 text-sm text-danger">Enter a whole number of seconds or milliseconds.</p>}
        {parsed && date && (
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <div className="border-b border-line bg-surface-2 px-4 py-2 text-xs text-muted">
              Detected as <span className="font-semibold text-foreground">{parsed.unit}</span>
            </div>
            <Row label="UTC" value={date.toLocaleString("en-GB", { timeZone: "UTC", dateStyle: "full", timeStyle: "long" })} />
            <Row label="Local" value={date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "long" }) + ` (${localZone})`} />
            <Row label="ISO 8601" value={date.toISOString()} />
            <Row label="RFC 2822" value={toRfc2822(date)} />
            <Row label="Relative" value={relativeTime(parsed.ms, now)} />
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Date → timestamp</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <input
            type="datetime-local"
            step={1}
            aria-label="Date and time"
            className="field max-w-xs"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          <div className="flex rounded-lg bg-surface-2 p-1 text-sm">
            {[
              { utc: false, label: "Local time" },
              { utc: true, label: "UTC" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setAsUtc(o.utc)}
                className={`rounded-md px-3 py-1.5 font-medium transition ${asUtc === o.utc ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {fromDate === null ? (
          <p className="mt-3 text-sm text-danger">Pick a valid date and time.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-line">
            <Row label="Seconds" value={String(Math.floor(fromDate / 1000))} />
            <Row label="Milliseconds" value={String(fromDate)} />
            <Row label="ISO 8601" value={new Date(fromDate).toISOString()} />
          </div>
        )}
      </div>
    </div>
  );
}
