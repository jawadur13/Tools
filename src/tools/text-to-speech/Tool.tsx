"use client";

import { Pause, Play, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Status = "idle" | "speaking" | "paused";
type Chunk = { text: string; offset: number };

const SAMPLE =
  "Welcome to JR Tools. This free text to speech tool reads any text aloud using the voices built into your device. Paste your own text, choose a voice and press play.";

/** Split into sentence-sized chunks; long single utterances get cut off in some browsers. */
function chunk(text: string, max = 220): Chunk[] {
  const chunks: Chunk[] = [];
  const re = /[^.!?।\n]+[.!?।]*\s*|\n+/g;
  let current = "";
  let start = 0;
  for (const m of text.matchAll(re)) {
    if (current && current.length + m[0].length > max) {
      chunks.push({ text: current, offset: start });
      current = "";
    }
    if (!current) start = m.index;
    current += m[0];
  }
  if (current.trim()) chunks.push({ text: current, offset: start });
  return chunks.filter((c) => c.text.trim());
}

function languageName(code: string) {
  try {
    return new Intl.DisplayNames(undefined, { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default function TextToSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [text, setText] = useState(SAMPLE);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lang, setLang] = useState("");
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [word, setWord] = useState<{ start: number; end: number } | null>(null);
  // Text being read; the editor is swapped for a highlighted view while speaking.
  const [spoken, setSpoken] = useState("");

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    const timer = setTimeout(load, 0);
    synth.addEventListener("voiceschanged", load);
    return () => {
      clearTimeout(timer);
      synth.removeEventListener("voiceschanged", load);
      synth.cancel();
    };
  }, [supported]);

  const languages = useMemo(() => {
    const codes = [...new Set(voices.map((v) => v.lang.split(/[-_]/)[0].toLowerCase()))];
    return codes.map((code) => ({ code, name: languageName(code) })).sort((a, b) => a.name.localeCompare(b.name));
  }, [voices]);

  const browserLang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en";
  const activeLang = lang || (languages.some((l) => l.code === browserLang) ? browserLang : languages[0]?.code ?? "");
  const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(activeLang));
  const voice = langVoices.find((v) => v.voiceURI === voiceURI) ?? langVoices.find((v) => v.default) ?? langVoices[0];

  function play() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const chunks = chunk(text);
    if (!chunks.length) return;
    setSpoken(text);
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c.text);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        const start = c.offset + e.charIndex;
        const len = e.charLength || (/^\S+/.exec(c.text.slice(e.charIndex))?.[0].length ?? 0);
        setWord({ start, end: start + len });
      };
      if (i === chunks.length - 1) {
        u.onend = () => {
          setStatus("idle");
          setWord(null);
        };
      }
      u.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          setStatus("idle");
          setWord(null);
        }
      };
      synth.speak(u);
    });
    setStatus("speaking");
  }

  function pause() {
    window.speechSynthesis.pause();
    setStatus("paused");
  }

  function resume() {
    window.speechSynthesis.resume();
    setStatus("speaking");
  }

  function stop() {
    window.speechSynthesis.cancel();
    setStatus("idle");
    setWord(null);
  }

  if (!supported) {
    return (
      <div className="card p-6 text-center text-muted">
        Your browser doesn&apos;t support speech synthesis. Try the latest Chrome, Edge or Safari.
      </div>
    );
  }

  const busy = status !== "idle";
  const shown = spoken;

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        {busy ? (
          <div className="min-h-56 whitespace-pre-wrap p-5 text-base leading-relaxed" aria-live="off">
            {word ? (
              <>
                {shown.slice(0, word.start)}
                <mark className="rounded bg-accent-soft px-0.5 text-accent">{shown.slice(word.start, word.end)}</mark>
                {shown.slice(word.end)}
              </>
            ) : (
              shown
            )}
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to read aloud…"
            aria-label="Text to read aloud"
            className="block min-h-56 w-full resize-y bg-transparent p-5 text-base leading-relaxed outline-none"
          />
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-3">
          <p className="flex-1 text-xs text-muted">{text.length.toLocaleString()} characters</p>
          {status === "idle" && (
            <button type="button" className="btn-primary" onClick={play} disabled={!text.trim()}>
              <Play className="size-4" /> Play
            </button>
          )}
          {status === "speaking" && (
            <button type="button" className="btn-primary" onClick={pause}>
              <Pause className="size-4" /> Pause
            </button>
          )}
          {status === "paused" && (
            <button type="button" className="btn-primary" onClick={resume}>
              <Play className="size-4" /> Resume
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={stop} disabled={!busy}>
            <Square className="size-4" /> Stop
          </button>
        </div>
      </div>

      <div className="card grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tts-lang">Language</label>
          <select
            id="tts-lang"
            className="field"
            value={activeLang}
            disabled={busy || !languages.length}
            onChange={(e) => {
              setLang(e.target.value);
              setVoiceURI("");
            }}
          >
            {!languages.length && <option>Loading voices…</option>}
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tts-voice">Voice</label>
          <select
            id="tts-voice"
            className="field"
            value={voice?.voiceURI ?? ""}
            disabled={busy || !langVoices.length}
            onChange={(e) => setVoiceURI(e.target.value)}
          >
            {langVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang}){v.localService ? "" : " · online"}
              </option>
            ))}
          </select>
        </div>
        {(
          [
            ["Speed", rate, setRate, 0.5, 2],
            ["Pitch", pitch, setPitch, 0, 2],
            ["Volume", volume, setVolume, 0, 1],
          ] as const
        ).map(([name, value, setter, min, max]) => (
          <div key={name}>
            <label className="label" htmlFor={`tts-${name}`}>
              {name}: {name === "Volume" ? `${Math.round(value * 100)}%` : `${value.toFixed(1)}×`}
            </label>
            <input
              id={`tts-${name}`}
              type="range"
              min={min}
              max={max}
              step={0.1}
              value={value}
              disabled={busy}
              onChange={(e) => setter(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        ))}
      </div>
      {voices.length > 0 && <p className="text-xs text-muted">{voices.length} voices available on this device.</p>}
    </div>
  );
}
