export type WallTime = { year: number; month: number; day: number; hour: number; minute: number; second: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(zone: string): Intl.DateTimeFormat {
  let f = formatters.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(zone, f);
  }
  return f;
}

/** Canonical IANA name ("asia/dhaka" → "Asia/Dhaka"), or null if unknown. */
export function canonicalZone(zone: string): string | null {
  if (!zone.trim()) return null;
  try {
    return formatter(zone.trim()).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/** The wall-clock time in `zone` at the instant `ms`. */
export function wallTimeAt(ms: number, zone: string): WallTime {
  const parts: Record<string, number> = {};
  for (const p of formatter(zone).formatToParts(new Date(ms))) {
    if (p.type !== "literal") parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour === 24 ? 0 : parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

const wallToUtcMs = (w: WallTime) => Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);

/** UTC offset of `zone` at instant `ms`, in minutes (Dhaka → 360). DST-aware. */
export function offsetMinutes(zone: string, ms: number): number {
  const whole = Math.floor(ms / 1000) * 1000;
  return Math.round((wallToUtcMs(wallTimeAt(whole, zone)) - whole) / 60000);
}

/**
 * The instant at which `zone` shows wall time `w`. Two passes handle offsets
 * that change around DST; times skipped by a spring-forward resolve forward.
 */
export function zonedToInstant(w: WallTime, zone: string): number {
  const guess = wallToUtcMs(w);
  const first = guess - offsetMinutes(zone, guess) * 60000;
  const second = guess - offsetMinutes(zone, first) * 60000;
  return offsetMinutes(zone, second) === offsetMinutes(zone, first) ? second : Math.max(first, second);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/** Calendar-day difference between two wall times (target − source). */
export function dayDifference(target: WallTime, source: WallTime): number {
  return Math.round(
    (Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(source.year, source.month - 1, source.day)) / 86400000,
  );
}

export function parseDateTimeLocal(value: string): WallTime | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const [year, month, day, hour, minute, second] = m.slice(1).map((x) => Number(x ?? 0));
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  return { year, month, day, hour, minute, second };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateTimeLocal(w: WallTime): string {
  return `${String(w.year).padStart(4, "0")}-${pad(w.month)}-${pad(w.day)}T${pad(w.hour)}:${pad(w.minute)}`;
}

/** All IANA zones the browser knows, always including UTC. */
export function allZones(): string[] {
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}
