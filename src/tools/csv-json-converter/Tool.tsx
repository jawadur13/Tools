"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FileDrop } from "@/components/FileDrop";
import { downloadBlob } from "@/lib/files";
import { csvRowsToJson, detectDelimiter, jsonToCsv, parseCsv, type Delimiter } from "./csv";

type Mode = "csv-to-json" | "json-to-csv";

const delimiterLabels: Record<Delimiter, string> = { ",": "Comma (,)", ";": "Semicolon (;)", "\t": "Tab", "|": "Pipe (|)" };

const SAMPLE_CSV = `name,age,city,member,note
Rahim Uddin,34,Dhaka,true,"Prefers ""email"" contact"
Ayesha Khan,28,Chattogram,false,"Line one
line two"
Tanvir Hasan,41,Sylhet,true,007`;

const SAMPLE_JSON = `[
  { "name": "Rahim Uddin", "age": 34, "city": "Dhaka" },
  { "name": "Ayesha Khan", "age": 28, "city": "Chattogram, BD", "tags": ["new", "vip"] }
]`;

const PREVIEW_ROWS = 50;

export default function CsvJsonConverter() {
  const [mode, setMode] = useState<Mode>("csv-to-json");
  const [input, setInput] = useState("");
  const [delimiterChoice, setDelimiterChoice] = useState<"auto" | Delimiter>("auto");
  const [header, setHeader] = useState(true);
  const [infer, setInfer] = useState(true);
  const [fileName, setFileName] = useState("data");

  const delimiter: Delimiter =
    delimiterChoice === "auto" ? (mode === "csv-to-json" ? detectDelimiter(input) : ",") : delimiterChoice;

  const result = useMemo((): { output: string; rows: string[][]; headed: boolean; error: string } => {
    if (!input.trim()) return { output: "", rows: [], headed: header, error: "" };
    try {
      if (mode === "csv-to-json") {
        const rows = parseCsv(input, delimiter);
        return { output: JSON.stringify(csvRowsToJson(rows, { header, infer }), null, 2), rows, headed: header, error: "" };
      }
      const data: unknown = JSON.parse(input);
      const csv = jsonToCsv(data, delimiter);
      // Arrays of arrays have no header row.
      const headed = !(Array.isArray(data) && data.length > 0 && data.every(Array.isArray));
      return { output: csv, rows: parseCsv(csv, delimiter), headed, error: "" };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not convert this input.";
      return { output: "", rows: [], headed: header, error: mode === "json-to-csv" && e instanceof SyntaxError ? `Invalid JSON: ${message}` : message };
    }
  }, [input, mode, delimiter, header, infer]);

  const [head, body] = result.headed ? [result.rows[0], result.rows.slice(1)] : [undefined, result.rows];

  function switchMode(next: Mode) {
    if (next === mode) return;
    setMode(next);
    // Carry the result over so you can round-trip.
    if (result.output && !result.error) setInput(result.output);
  }

  async function loadFile([file]: File[]) {
    const text = await file.text();
    setFileName(file.name.replace(/\.[^.]+$/, "") || "data");
    setMode(/\.json$/i.test(file.name) || file.type === "application/json" ? "json-to-csv" : "csv-to-json");
    setInput(text);
  }

  function download() {
    const isJson = mode === "csv-to-json";
    downloadBlob(
      new Blob([result.output], { type: isJson ? "application/json" : "text/csv;charset=utf-8" }),
      `${fileName}.${isJson ? "json" : "csv"}`,
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-surface-2 p-1 text-sm">
          {(
            [
              ["csv-to-json", "CSV → JSON"],
              ["json-to-csv", "JSON → CSV"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => switchMode(id)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${mode === id ? "bg-accent text-accent-fg" : "text-muted hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary ml-auto py-1.5"
          onClick={() => setInput(mode === "csv-to-json" ? SAMPLE_CSV : SAMPLE_JSON)}
        >
          Load sample
        </button>
      </div>

      <FileDrop
        accept=".csv,text/csv,.json,application/json,.txt,text/plain,.tsv,text/tab-separated-values"
        multiple={false}
        label="Drop a CSV or JSON file, or click to choose"
        hint="Or paste your data below"
        onFiles={loadFile}
      />

      <div className="card grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="cj-delim">
            Delimiter
          </label>
          <select
            id="cj-delim"
            className="field"
            value={delimiterChoice}
            onChange={(e) => setDelimiterChoice(e.target.value as "auto" | Delimiter)}
          >
            <option value="auto">
              {mode === "csv-to-json" ? `Auto-detect (${delimiterLabels[delimiter]})` : "Comma (,)"}
            </option>
            {Object.entries(delimiterLabels).map(([d, label]) => (
              <option key={label} value={d}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {mode === "csv-to-json" && (
          <>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} />
              First row is a header
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={infer} onChange={(e) => setInfer(e.target.checked)} />
              Detect numbers &amp; booleans
            </label>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label className="label" htmlFor="cj-input">
            {mode === "csv-to-json" ? "CSV input" : "JSON input"}
          </label>
          <textarea
            id="cj-input"
            className="field min-h-72 font-mono text-xs leading-relaxed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder={mode === "csv-to-json" ? "name,email\nRahim,rahim@example.com" : '[{"name": "Rahim"}]'}
          />
        </div>
        <div>
          <p className="label">{mode === "csv-to-json" ? "JSON output" : "CSV output"}</p>
          <textarea
            aria-label="Output"
            readOnly
            className="field min-h-72 bg-surface-2 font-mono text-xs leading-relaxed"
            value={result.output}
            spellCheck={false}
          />
        </div>
      </div>

      {result.error && <p className="text-sm text-danger">{result.error}</p>}

      {result.output && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 text-sm text-muted">
            {body.length} row{body.length === 1 ? "" : "s"}
            {head ? ` · ${head.length} column${head.length === 1 ? "" : "s"}` : ""}
          </p>
          <CopyButton text={result.output} />
          <button type="button" className="btn-primary" onClick={download}>
            <Download className="size-4" /> Download .{mode === "csv-to-json" ? "json" : "csv"}
          </button>
        </div>
      )}

      {result.rows.length > 0 && (
        <div className="card overflow-hidden">
          <p className="border-b border-line px-4 py-2 text-xs text-muted">
            Preview{body.length > PREVIEW_ROWS ? ` · first ${PREVIEW_ROWS} of ${body.length} rows` : ""}
          </p>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-left text-sm">
              {head && (
                <thead className="sticky top-0 bg-surface-2">
                  <tr>
                    {head.map((h, i) => (
                      <th key={i} className="whitespace-nowrap px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {body.slice(0, PREVIEW_ROWS).map((row, r) => (
                  <tr key={r} className="border-t border-line">
                    {row.map((v, c) => (
                      <td key={c} className="max-w-xs truncate px-3 py-2 text-muted" title={v}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
