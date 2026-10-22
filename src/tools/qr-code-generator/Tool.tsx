"use client";

import { Download } from "lucide-react";
import QRCode, { type QRCodeErrorCorrectionLevel } from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { downloadBlob } from "@/lib/files";

type Kind = "url" | "text" | "wifi" | "email" | "phone";

const kinds: { id: Kind; label: string }[] = [
  { id: "url", label: "Link" },
  { id: "text", label: "Text" },
  { id: "wifi", label: "WiFi" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
];

// Characters with special meaning in the WIFI: payload must be backslash-escaped.
const escapeWifi = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

export default function QrCodeGenerator() {
  const [kind, setKind] = useState<Kind>("url");
  const [url, setUrl] = useState("https://tools.jawadurrafid.com");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({ ssid: "", password: "", security: "WPA", hidden: false });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [phone, setPhone] = useState("");
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [size, setSize] = useState(512);
  const [level, setLevel] = useState<QRCodeErrorCorrectionLevel>("M");
  const [rendered, setRendered] = useState("");

  const payload = useMemo(() => {
    switch (kind) {
      case "url":
        return url.trim();
      case "text":
        return text;
      case "wifi":
        if (!wifi.ssid) return "";
        return `WIFI:T:${wifi.security};S:${escapeWifi(wifi.ssid)};${
          wifi.security === "nopass" ? "" : `P:${escapeWifi(wifi.password)};`
        }${wifi.hidden ? "H:true;" : ""};`;
      case "email": {
        if (!email.to) return "";
        const params = new URLSearchParams();
        if (email.subject) params.set("subject", email.subject);
        if (email.body) params.set("body", email.body);
        const qs = params.toString().replace(/\+/g, "%20");
        return `mailto:${email.to}${qs ? `?${qs}` : ""}`;
      }
      case "phone":
        return phone.trim() ? `tel:${phone.replace(/\s+/g, "")}` : "";
    }
  }, [kind, url, text, wifi, email, phone]);

  const options = useMemo(
    () => ({ errorCorrectionLevel: level, margin: 2, width: size, color: { dark, light } }),
    [level, size, dark, light],
  );

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    QRCode.toDataURL(payload, options)
      .then((data) => !cancelled && setRendered(data))
      .catch(() => !cancelled && setRendered(""));
    return () => {
      cancelled = true;
    };
  }, [payload, options]);

  const preview = payload ? rendered : "";

  async function downloadPng() {
    const blob = await (await fetch(preview)).blob();
    downloadBlob(blob, "qr-code.png");
  }

  async function downloadSvg() {
    const svg = await QRCode.toString(payload, { ...options, type: "svg" });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg");
  }

  return (
    <div className="card grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                kind === k.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {kind === "url" && (
          <div>
            <label className="label" htmlFor="qr-url">Website URL</label>
            <input id="qr-url" className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
          </div>
        )}

        {kind === "text" && (
          <div>
            <label className="label" htmlFor="qr-text">Text</label>
            <textarea id="qr-text" className="field min-h-28" value={text} onChange={(e) => setText(e.target.value)} placeholder="Any text you want to share" />
          </div>
        )}

        {kind === "wifi" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="qr-ssid">Network name (SSID)</label>
              <input id="qr-ssid" className="field" value={wifi.ssid} onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="qr-pass">Password</label>
              <input
                id="qr-pass"
                className="field"
                value={wifi.password}
                disabled={wifi.security === "nopass"}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="qr-sec">Security</label>
              <select id="qr-sec" className="field" value={wifi.security} onChange={(e) => setWifi({ ...wifi, security: e.target.value })}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (open network)</option>
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={wifi.hidden} onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })} />
              Hidden network
            </label>
          </div>
        )}

        {kind === "email" && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="qr-to">Email address</label>
              <input id="qr-to" type="email" className="field" value={email.to} onChange={(e) => setEmail({ ...email, to: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="qr-subj">Subject (optional)</label>
              <input id="qr-subj" className="field" value={email.subject} onChange={(e) => setEmail({ ...email, subject: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="qr-body">Message (optional)</label>
              <textarea id="qr-body" className="field min-h-20" value={email.body} onChange={(e) => setEmail({ ...email, body: e.target.value })} />
            </div>
          </div>
        )}

        {kind === "phone" && (
          <div>
            <label className="label" htmlFor="qr-phone">Phone number</label>
            <input id="qr-phone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXX XXXXXX" />
          </div>
        )}

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div className="flex gap-4">
            <div>
              <label className="label" htmlFor="qr-dark">Foreground</label>
              <input id="qr-dark" type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface" />
            </div>
            <div>
              <label className="label" htmlFor="qr-light">Background</label>
              <input id="qr-light" type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-10 w-16 cursor-pointer rounded-lg border border-line bg-surface" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="qr-level">Error correction</label>
            <select id="qr-level" className="field" value={level} onChange={(e) => setLevel(e.target.value as QRCodeErrorCorrectionLevel)}>
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="qr-size">
              Size: {size} × {size}px
            </label>
            <input id="qr-size" type="range" min={128} max={2048} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-accent" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-line bg-surface-2 p-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- generated data URL
            <img src={preview} alt="QR code preview" className="w-full rounded-lg" />
          ) : (
            <p className="text-center text-sm text-muted">Fill in the details to see your QR code</p>
          )}
        </div>
        <button type="button" className="btn-primary w-full" disabled={!preview} onClick={downloadPng}>
          <Download className="size-4" /> Download PNG
        </button>
        <button type="button" className="btn-secondary w-full" disabled={!preview} onClick={downloadSvg}>
          <Download className="size-4" /> Download SVG
        </button>
      </div>
    </div>
  );
}
