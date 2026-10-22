"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9.qkzUkUXXg7zGjKe1vxNJsmZ1VkhG3h6Bd5lLMUfN3gQ";

type Decoded = { header: unknown; payload: unknown; parts: string[] } | { error: string };

function base64UrlDecode(part: string): string {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function decode(token: string): Decoded | null {
  const trimmed = token.trim().replace(/^Bearer\s+/i, "");
  if (!trimmed) return null;
  const parts = trimmed.split(".");
  if (parts.length !== 3) return { error: `A JWT has 3 parts separated by dots — this has ${parts.length}.` };
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, parts };
  } catch {
    return { error: "This doesn't look like a valid JWT. The header or payload isn't Base64URL-encoded JSON." };
  }
}

const CLAIMS: [string, string][] = [
  ["iat", "Issued at"],
  ["nbf", "Not before"],
  ["exp", "Expires"],
];

function relative(seconds: number) {
  const abs = Math.abs(seconds);
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  const fmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [size, unit] of units) if (abs >= size) return fmt.format(Math.round(seconds / size), unit);
  return fmt.format(Math.round(seconds), "second");
}

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const decoded = useMemo(() => decode(token), [token]);
  const ok = decoded && !("error" in decoded) ? decoded : null;
  const payload = (ok?.payload ?? {}) as Record<string, unknown>;

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null;
  const status = !ok ? null : exp !== null && exp < now ? "expired" : nbf !== null && nbf > now ? "not-yet" : "valid";

  const json = (v: unknown) => JSON.stringify(v, null, 2);

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Encoded token</p>
        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setNow(Math.floor(Date.now() / 1000));
          }}
          spellCheck={false}
          placeholder="Paste a JWT (eyJ…)"
          aria-label="JWT"
          className="block min-h-28 w-full resize-y break-all bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
        />
        {ok && (
          <p className="break-all border-t border-line bg-surface-2 p-4 font-mono text-sm leading-relaxed">
            <span className="text-danger">{ok.parts[0]}</span>.<span className="text-accent">{ok.parts[1]}</span>.
            <span className="text-success">{ok.parts[2]}</span>
          </p>
        )}
      </div>

      {decoded && "error" in decoded && <p className="text-sm text-danger">{decoded.error}</p>}

      {ok && (
        <>
          <div className="card flex flex-wrap items-center gap-3 p-5">
            {status === "expired" && (
              <span className="rounded-full bg-danger/15 px-3 py-1 text-sm font-semibold text-danger">Expired</span>
            )}
            {status === "not-yet" && (
              <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">Not valid yet</span>
            )}
            {status === "valid" && (
              <span className="rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-success">
                {exp === null ? "No expiry" : "Not expired"}
              </span>
            )}
            <div className="flex flex-1 flex-wrap gap-x-6 gap-y-2 text-sm">
              {CLAIMS.map(([claim, label]) => {
                const v = payload[claim];
                if (typeof v !== "number") return null;
                return (
                  <p key={claim}>
                    <span className="text-muted">{label}:</span> {new Date(v * 1000).toLocaleString()}{" "}
                    <span className="text-muted">({relative(v - now)})</span>
                  </p>
                );
              })}
            </div>
            <button
              type="button"
              className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
              onClick={() => setNow(Math.floor(Date.now() / 1000))}
              aria-label="Recheck expiry against current time"
              title="Recheck against current time"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {(
              [
                ["Header", ok.header, "text-danger"],
                ["Payload", ok.payload, "text-accent"],
              ] as const
            ).map(([title, value, color]) => (
              <div key={title} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-2">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{title}</p>
                  <CopyButton text={json(value)} label={`Copy ${title.toLowerCase()}`} iconOnly />
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">{json(value)}</pre>
              </div>
            ))}
          </div>

          <p className="flex items-start gap-2 text-sm text-muted">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            The signature is not verified. Anyone can decode a JWT — only your server, with the secret or public key, can confirm it&apos;s genuine.
          </p>
        </>
      )}
    </div>
  );
}
