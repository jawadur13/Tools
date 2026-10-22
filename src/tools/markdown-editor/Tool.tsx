"use client";

import DOMPurify from "dompurify";
import { Bold, Code, Download, Heading, Italic, Link, List } from "lucide-react";
import { marked } from "marked";
import { useMemo, useRef, useState, type ComponentType } from "react";
import { CopyButton } from "@/components/CopyButton";
import { downloadBlob } from "@/lib/files";

const SAMPLE = `# Welcome to the Markdown Editor

Write on the left and see the **live preview** here. It supports *GitHub Flavored Markdown*.

## Lists

- Plain bullet points
- [x] Task lists
- [ ] Unchecked items

1. Numbered
2. Lists

## Code

Inline \`code\` and blocks:

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

> Blockquotes look like this.

| Feature | Supported |
| ------- | --------- |
| Tables  | Yes       |
| Links   | [Yes](https://tools.jawadurrafid.com) |
`;

type Action = { icon: ComponentType<{ className?: string }>; label: string; run: (sel: string) => { text: string; line?: boolean } };

const actions: Action[] = [
  { icon: Bold, label: "Bold", run: (s) => ({ text: `**${s || "bold text"}**` }) },
  { icon: Italic, label: "Italic", run: (s) => ({ text: `*${s || "italic text"}*` }) },
  { icon: Heading, label: "Heading", run: (s) => ({ text: `## ${s || "Heading"}`, line: true }) },
  { icon: Link, label: "Link", run: (s) => ({ text: `[${s || "link text"}](https://)` }) },
  {
    icon: List,
    label: "Bulleted list",
    run: (s) => ({ text: (s || "List item").split("\n").map((l) => `- ${l}`).join("\n"), line: true }),
  },
  { icon: Code, label: "Code", run: (s) => ({ text: s.includes("\n") ? `\`\`\`\n${s}\n\`\`\`` : `\`${s || "code"}\`` }) },
];

const previewStyles = [
  "[&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold",
  "[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold",
  "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold",
  "[&_p]:my-3 [&_p]:leading-relaxed",
  "[&_a]:text-accent [&_a]:underline",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
  "[&_li:has(input)]:list-none [&_li_input]:mr-2",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted",
  "[&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-2 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-line [&_th]:bg-surface-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
  "[&_hr]:my-6 [&_hr]:border-line [&_img]:max-w-full [&_img]:rounded-lg",
].join(" ");

export default function MarkdownEditor() {
  const [md, setMd] = useState(SAMPLE);
  const editor = useRef<HTMLTextAreaElement>(null);

  const html = useMemo(() => DOMPurify.sanitize(marked.parse(md, { async: false, gfm: true })), [md]);
  const words = md.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;

  function apply(action: Action) {
    const el = editor.current;
    if (!el) return;
    let start = el.selectionStart;
    const end = el.selectionEnd;
    const { text, line } = action.run(md.slice(start, end));
    // Line-level formatting (headings, lists) starts at the beginning of the line.
    if (line) start = md.lastIndexOf("\n", start - 1) + 1;
    const next = md.slice(0, start) + text + md.slice(end);
    setMd(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + text.length);
    });
  }

  function downloadHtml() {
    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Document</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;line-height:1.6}pre{background:#f4f4f6;padding:12px;border-radius:8px;overflow:auto}code{font-family:ui-monospace,monospace}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px}blockquote{border-left:4px solid #ccc;margin:0;padding-left:16px;color:#555}</style>
</head>
<body>
${html}
</body>
</html>
`;
    downloadBlob(new Blob([doc], { type: "text/html" }), "document.html");
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-1 p-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.label}
            aria-label={a.label}
            onClick={() => apply(a)}
            className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground"
          >
            <a.icon className="size-4" />
          </button>
        ))}
        <span className="ml-auto flex flex-wrap gap-2">
          <CopyButton text={html} label="Copy HTML" className="btn-secondary py-1.5" />
          <button type="button" className="btn-secondary py-1.5" onClick={() => downloadBlob(new Blob([md], { type: "text/markdown" }), "document.md")}>
            <Download className="size-4" /> .md
          </button>
          <button type="button" className="btn-secondary py-1.5" onClick={downloadHtml}>
            <Download className="size-4" /> .html
          </button>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card flex flex-col overflow-hidden">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Markdown</p>
          <textarea
            ref={editor}
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            aria-label="Markdown"
            className="block min-h-[32rem] w-full flex-1 resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          />
        </div>
        <div className="card flex flex-col overflow-hidden">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
          <div className={`min-h-[32rem] flex-1 overflow-auto p-5 ${previewStyles}`} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      <p className="text-xs text-muted">
        {words.toLocaleString()} words · {md.length.toLocaleString()} characters
      </p>
    </div>
  );
}
