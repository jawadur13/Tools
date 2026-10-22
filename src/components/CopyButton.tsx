"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  text: string;
  label?: string;
  /** Icon-only button for tight rows; label is then used as the aria-label. */
  iconOnly?: boolean;
  className?: string;
};

/** Copies `text` to the clipboard and briefly confirms with "Copied!". */
export function CopyButton({ text, label = "Copy", iconOnly = false, className = "btn-secondary" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); nothing useful to show.
    }
  }

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      aria-label={iconOnly ? label : undefined}
      className={iconOnly ? "rounded-md p-2 text-muted hover:bg-surface-2 hover:text-foreground disabled:opacity-40" : className}
    >
      <Icon className={`size-4 ${copied ? "text-success" : ""}`} />
      {!iconOnly && (copied ? "Copied!" : label)}
    </button>
  );
}
