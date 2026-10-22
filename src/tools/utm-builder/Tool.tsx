"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

type Field = "source" | "medium" | "campaign" | "term" | "content";

const fields: { id: Field; label: string; placeholder: string; required?: boolean }[] = [
  { id: "source", label: "Campaign source", placeholder: "facebook, google, newsletter", required: true },
  { id: "medium", label: "Campaign medium", placeholder: "cpc, social, email", required: true },
  { id: "campaign", label: "Campaign name", placeholder: "summer_sale", required: true },
  { id: "term", label: "Campaign term", placeholder: "running+shoes (optional)" },
  { id: "content", label: "Campaign content", placeholder: "banner_a (optional)" },
];

const presets: { label: string; source: string; medium: string }[] = [
  { label: "Facebook Ads", source: "facebook", medium: "cpc" },
  { label: "Instagram", source: "instagram", medium: "social" },
  { label: "Google Ads", source: "google", medium: "cpc" },
  { label: "Newsletter", source: "newsletter", medium: "email" },
  { label: "WhatsApp", source: "whatsapp", medium: "social" },
];

export default function UtmBuilder() {
  const [url, setUrl] = useState("");
  const [values, setValues] = useState<Record<Field, string>>({
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const raw = url.trim();
    if (!raw) return { url: "", error: "" };
    let parsed: URL;
    try {
      parsed = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      return { url: "", error: "That doesn't look like a valid URL." };
    }
    for (const f of fields) {
      const v = values[f.id].trim();
      if (v) parsed.searchParams.set(`utm_${f.id}`, v);
      else parsed.searchParams.delete(`utm_${f.id}`);
    }
    return { url: parsed.toString(), error: "" };
  }, [url, values]);

  const missing = fields.filter((f) => f.required && !values[f.id].trim()).map((f) => `utm_${f.id}`);

  async function copy() {
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="card space-y-5 p-5 sm:p-8">
      <div>
        <label className="label" htmlFor="utm-url">Website URL</label>
        <input
          id="utm-url"
          className="field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/landing-page"
        />
        {result.error && <p className="mt-1.5 text-sm text-danger">{result.error}</p>}
      </div>

      <div>
        <p className="label">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const active = values.source === p.source && values.medium === p.medium;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => setValues({ ...values, source: p.source, medium: p.medium })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className={f.id === "campaign" ? "sm:col-span-2" : undefined}>
            <label className="label" htmlFor={`utm-${f.id}`}>
              {f.label} <span className="font-mono text-xs text-muted">utm_{f.id}</span>
              {f.required && <span className="text-danger"> *</span>}
            </label>
            <input
              id={`utm-${f.id}`}
              className="field"
              value={values[f.id]}
              onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-line pt-5">
        <p className="label">Your tracking URL</p>
        <div className="break-all rounded-lg border border-line bg-surface-2 p-4 font-mono text-sm">
          {result.url || <span className="text-muted">Enter a URL to generate your link</span>}
        </div>
        {result.url && missing.length > 0 && (
          <p className="mt-1.5 text-sm text-muted">Tip: also fill in {missing.join(", ")} for complete tracking.</p>
        )}
        <button type="button" className="btn-primary mt-4" disabled={!result.url} onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy URL"}
        </button>
      </div>
    </div>
  );
}
