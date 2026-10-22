"use client";

import { Check, Copy, Download, ExternalLink } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { downloadBlob } from "@/lib/files";

const countries = [
  { code: "880", name: "Bangladesh" },
  { code: "91", name: "India" },
  { code: "92", name: "Pakistan" },
  { code: "977", name: "Nepal" },
  { code: "94", name: "Sri Lanka" },
  { code: "966", name: "Saudi Arabia" },
  { code: "971", name: "United Arab Emirates" },
  { code: "974", name: "Qatar" },
  { code: "965", name: "Kuwait" },
  { code: "968", name: "Oman" },
  { code: "60", name: "Malaysia" },
  { code: "65", name: "Singapore" },
  { code: "44", name: "United Kingdom" },
  { code: "1", name: "United States / Canada" },
  { code: "61", name: "Australia" },
  { code: "49", name: "Germany" },
  { code: "39", name: "Italy" },
];

export default function WhatsappLinkGenerator() {
  const [country, setCountry] = useState("880");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");

  const digits = useMemo(() => {
    let local = phone.replace(/\D/g, "");
    // People often paste the full international number; don't double the code.
    if (local.startsWith(country) && local.length > country.length + 6) local = local.slice(country.length);
    local = local.replace(/^0+/, "");
    return local ? `${country}${local}` : "";
  }, [country, phone]);

  const link = useMemo(() => {
    if (digits.length < 8) return "";
    const text = message.trim();
    return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  }, [digits, message]);

  useEffect(() => {
    if (!link) return;
    let cancelled = false;
    QRCode.toDataURL(link, { width: 512, margin: 2, errorCorrectionLevel: "M" })
      .then((data) => !cancelled && setQr(data))
      .catch(() => !cancelled && setQr(""));
    return () => {
      cancelled = true;
    };
  }, [link]);

  const preview = link ? qr : "";

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadQr() {
    const blob = await (await fetch(preview)).blob();
    downloadBlob(blob, `whatsapp-${digits}.png`);
  }

  return (
    <div className="card grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_240px]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <label className="label" htmlFor="wa-country">Country code</label>
            <select id="wa-country" className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((c) => (
                <option key={c.name} value={c.code}>
                  {c.name} (+{c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="wa-phone">WhatsApp number</label>
            <input
              id="wa-phone"
              type="tel"
              className="field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01712 345678"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="wa-message">Pre-filled message (optional)</label>
          <textarea
            id="wa-message"
            className="field min-h-28"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi! I'd like to know more about your products."
          />
        </div>

        <div>
          <p className="label">Your WhatsApp link</p>
          <div className="break-all rounded-lg border border-line bg-surface-2 p-4 font-mono text-sm">
            {link || <span className="text-muted">Enter a phone number to generate your link</span>}
          </div>
          {digits && !link && <p className="mt-1.5 text-sm text-danger">That number looks too short.</p>}
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" disabled={!link} onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={link || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!link}
            className={`btn-secondary ${link ? "" : "pointer-events-none opacity-50"}`}
          >
            <ExternalLink className="size-4" /> Open in WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-line bg-surface-2 p-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- generated data URL
            <img src={preview} alt="WhatsApp link QR code" className="w-full rounded-lg" />
          ) : (
            <p className="text-center text-sm text-muted">Your QR code will appear here</p>
          )}
        </div>
        <button type="button" className="btn-secondary w-full" disabled={!preview} onClick={downloadQr}>
          <Download className="size-4" /> Download QR
        </button>
      </div>
    </div>
  );
}
