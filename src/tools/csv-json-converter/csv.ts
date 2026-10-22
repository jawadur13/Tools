export const DELIMITERS = [",", ";", "\t", "|"] as const;
export type Delimiter = (typeof DELIMITERS)[number];

/** Picks the delimiter that appears most often (outside quotes) in the first line. */
export function detectDelimiter(text: string): Delimiter {
  const counts = new Map<Delimiter, number>(DELIMITERS.map((d) => [d, 0]));
  let inQuotes = false;
  for (const ch of text) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && (ch === "\n" || ch === "\r")) break;
    else if (!inQuotes && counts.has(ch as Delimiter)) counts.set(ch as Delimiter, counts.get(ch as Delimiter)! + 1);
  }
  let best: Delimiter = ",";
  for (const [d, n] of counts) if (n > counts.get(best)!) best = d;
  return best;
}

/**
 * RFC 4180 parser: quoted fields, "" escapes and line breaks inside quotes.
 * Accepts \n, \r\n and \r line endings and ignores one trailing newline.
 */
export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  if (text.charCodeAt(0) === 0xfeff) i = 1; // byte-order mark

  for (; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"' && field === "") {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (inQuotes) throw new Error("A quoted field is never closed.");
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop fully empty lines (e.g. blank lines at the end).
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

/** "42" → 42, "true" → true; keeps values like "007" or "+880..." as strings. */
export function inferValue(value: string): string | number | boolean | null {
  if (value === "") return "";
  if (NUMBER.test(value)) {
    const n = Number(value);
    if (Number.isFinite(n) && (Number.isSafeInteger(n) || value.includes(".") || /e/i.test(value))) return n;
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return value;
}

/** Unique, non-empty header names: blanks become column_N, duplicates get _2, _3… */
function cleanHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((h, i) => {
    const base = h.trim() || `column_${i + 1}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}_${count}`;
  });
}

export type CsvToJsonOptions = { header: boolean; infer: boolean };

export function csvRowsToJson(rows: string[][], { header, infer }: CsvToJsonOptions): unknown[] {
  const convert = (v: string) => (infer ? inferValue(v) : v);
  if (!header) return rows.map((r) => r.map(convert));
  const [head = [], ...body] = rows;
  const keys = cleanHeaders(head);
  return body.map((r) => {
    const obj: Record<string, unknown> = {};
    const width = Math.max(keys.length, r.length);
    for (let i = 0; i < width; i++) obj[keys[i] ?? `column_${i + 1}`] = convert(r[i] ?? "");
    return obj;
  });
}

function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function quote(value: string, delimiter: string): string {
  return /["\r\n]/.test(value) || value.includes(delimiter) || /^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Array of objects → CSV with the union of all keys as header (first-seen order).
 * Arrays of arrays become header-less rows; a single object becomes one row.
 */
export function jsonToCsv(data: unknown, delimiter: string): string {
  const list = Array.isArray(data) ? data : [data];
  if (list.length === 0) return "";
  const line = (values: unknown[]) => values.map((v) => quote(cell(v), delimiter)).join(delimiter);

  if (list.every((item) => Array.isArray(item))) return (list as unknown[][]).map(line).join("\r\n");
  if (!list.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
    throw new Error("JSON must be an array of objects (or an array of arrays).");
  }
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const item of list as Record<string, unknown>[]) {
    for (const k of Object.keys(item)) {
      if (seen.has(k)) continue;
      seen.add(k);
      keys.push(k);
    }
  }
  return [line(keys), ...(list as Record<string, unknown>[]).map((item) => line(keys.map((k) => item[k])))].join("\r\n");
}
