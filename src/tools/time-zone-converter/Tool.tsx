"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  allZones,
  canonicalZone,
  dayDifference,
  formatOffset,
  offsetMinutes,
  parseDateTimeLocal,
  toDateTimeLocal,
  wallTimeAt,
  zonedToInstant,
} from "./tz";

const DEFAULT_TARGETS = ["Asia/Dhaka", "UTC", "America/New_York", "Europe/London", "Asia/Dubai"];

const cityName = (zone: string) => (zone === "UTC" ? "UTC" : zone.split("/").pop()!.replace(/_/g, " "));

function ZoneInput({
  id,
  value,
  onChange,
  zones,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  zones: string[];
  placeholder?: string;
}) {
  return (
    <>
      <input
        id={id}
        list={`${id}-list`}
        className="field"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      <datalist id={`${id}-list`}>
        {zones.map((z) => (
          <option key={z} value={z} />
        ))}
      </datalist>
    </>
  );
}

export default function TimeZoneConverter() {
  const zones = useMemo(() => allZones(), []);
  const [source, setSource] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [sourceInput, setSourceInput] = useState(source);
  const [when, setWhen] = useState(() => toDateTimeLocal(wallTimeAt(Date.now(), source)));
  const [targets, setTargets] = useState<string[]>(() => DEFAULT_TARGETS.filter((z) => z !== source));
  const [newZone, setNewZone] = useState("");

  const sourceWall = parseDateTimeLocal(when);
  const instant = sourceWall ? zonedToInstant(sourceWall, source) : null;
  const candidate = canonicalZone(newZone);
  const canAdd = candidate !== null && !targets.includes(candidate);

  function changeSource(value: string) {
    setSourceInput(value);
    // Only switch once the text is a real zone, keeping the same wall time.
    const zone = canonicalZone(value);
    if (zone) setSource(zone);
  }

  function add() {
    if (!canAdd) return;
    setTargets((t) => [...t, candidate]);
    setNewZone("");
  }

  return (
    <div className="space-y-5">
      <div className="card grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="tz-when">
            Date &amp; time
          </label>
          <input id="tz-when" type="datetime-local" className="field" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="tz-source">
            In time zone
          </label>
          <ZoneInput id="tz-source" value={sourceInput} onChange={changeSource} zones={zones} />
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setWhen(toDateTimeLocal(wallTimeAt(Date.now(), source)))}
        >
          Now
        </button>
        {canonicalZone(sourceInput) !== source && (
          <p className="text-sm text-danger sm:col-span-3">
            “{sourceInput}” isn&apos;t a known time zone — still using {source}. Pick one from the list, e.g. Asia/Dhaka.
          </p>
        )}
        {instant !== null && (
          <p className="text-sm text-muted sm:col-span-3">
            {source} is currently at <span className="font-medium text-foreground">{formatOffset(offsetMinutes(source, instant))}</span>{" "}
            on this date.
          </p>
        )}
      </div>

      {instant === null ? (
        <p className="card p-5 text-sm text-muted">Pick a valid date and time.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {targets.map((zone) => {
            const wall = wallTimeAt(instant, zone);
            const diff = dayDifference(wall, sourceWall!);
            const date = new Date(Date.UTC(wall.year, wall.month - 1, wall.day));
            return (
              <div key={zone} className="card flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{cityName(zone)}</p>
                  <p className="truncate text-xs text-muted">
                    {zone} · {formatOffset(offsetMinutes(zone, instant))}
                  </p>
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums">
                      {String(wall.hour).padStart(2, "0")}:{String(wall.minute).padStart(2, "0")}
                    </span>
                    {diff !== 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${diff > 0 ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted"}`}
                      >
                        {diff > 0 ? "+" : "−"}
                        {Math.abs(diff)} day{Math.abs(diff) === 1 ? "" : "s"}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    {date.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${zone}`}
                  onClick={() => setTargets((t) => t.filter((z) => z !== zone))}
                  className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form
        className="card flex flex-wrap items-end gap-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="tz-add">
            Add a time zone
          </label>
          <ZoneInput id="tz-add" value={newZone} onChange={setNewZone} zones={zones} placeholder="Search, e.g. Tokyo or Australia/Sydney" />
        </div>
        <button type="submit" className="btn-primary" disabled={!canAdd}>
          <Plus className="size-4" /> Add
        </button>
      </form>
    </div>
  );
}
