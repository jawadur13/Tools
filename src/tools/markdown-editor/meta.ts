import type { ToolMeta } from "../types";

export const meta: ToolMeta = {
  slug: "markdown-editor",
  name: "Markdown Editor",
  tagline: "Write Markdown with a live preview, then export HTML or .md files.",
  description:
    "Free online Markdown editor with live preview. Format with toolbar shortcuts, see the rendered result instantly, and copy HTML or download .md and .html files.",
  category: "text",
  icon: "NotebookPen",
  keywords: ["markdown editor", "markdown to html", "markdown preview", "online markdown editor", "md editor"],
  steps: [
    "Write or paste Markdown on the left. The preview on the right updates as you type.",
    "Use the toolbar for bold, italic, headings, links, lists and code.",
    "Copy the generated HTML, or download your work as a .md or .html file.",
  ],
  faq: [
    {
      q: "Which Markdown features are supported?",
      a: "GitHub Flavored Markdown: headings, emphasis, links, images, lists, task lists, tables, blockquotes, code blocks and strikethrough.",
    },
    {
      q: "Is the HTML output safe to use?",
      a: "The preview is sanitized to remove scripts and other unsafe markup, so pasting untrusted Markdown won't run code in your browser.",
    },
    {
      q: "Is my document saved?",
      a: "Your text stays in this browser tab only. Download it as a .md file to keep a copy — nothing is uploaded to a server.",
    },
  ],
};
