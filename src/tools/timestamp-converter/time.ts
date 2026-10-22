export type ParsedTimestamp = { ms: number; unit: "seconds" | "milliseconds" };

// Anything at or above 1e11 is treated as milliseconds: 1e11 seconds is the
// year 5138, while 1e11 milliseconds is March 1973.
const MS_THRESHOLD = 1e11;

/** Parses a Unix timestamp in seconds or milliseconds; null if invalid. */
export function parseTimestamp(input: string): ParsedTimestamp | null {
  const s = input.trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  const unit = Math.abs(n) >= MS_THRESHOLD ? "milliseconds" : "seconds";
  const ms = unit === "seconds" ? n * 1000 : n;
  // JavaScript dates only cover ±8.64e15 ms around the epoch.
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15) return null;
  return { ms: Math.round(ms), unit };
}

const pad = (n: number, width = 2) => String(Math.abs(n)).padStart(width, "0");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** RFC 2822 date in UTC, e.g. "Thu, 22 Oct 2026 01:59:00 +0000". */
export function toRfc2822(date: Date): string {
  return `${DAYS[date.getUTCDay()]}, ${pad(date.getUTCDate())} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365.2425 * 86400],
  ["month", 30.436875 * 86400],
  ["week", 7 * 86400],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** Human relative time between `ms` and `now`, e.g. "3 days ago" or "in 2 hours". */
export function relativeTime(ms: number, now: number): string {
  const diff = (ms - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diff) >= seconds || unit === "second") {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }
  return rtf.format(0, "second");
}

/** Value for <input type="datetime-local" step="1">, in local time or UTC. */
export function toDateTimeLocal(date: Date, utc = false): string {
  const g = utc
    ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
    : [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
  return `${pad(g[0], 4)}-${pad(g[1])}-${pad(g[2])}T${pad(g[3])}:${pad(g[4])}:${pad(g[5])}`;
}

/** Parses a datetime-local value as local time or UTC; null if invalid. */
export function fromDateTimeLocal(value: string, utc = false): number | null {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1).map((x) => Number(x ?? 0));
  const ms = utc ? Date.UTC(y, mo - 1, d, h, mi, s) : new Date(y, mo - 1, d, h, mi, s).getTime();
  return Number.isNaN(ms) ? null : ms;
}
