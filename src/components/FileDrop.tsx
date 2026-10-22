"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  onFiles: (files: File[]) => void;
};

/** Drag-and-drop zone that also opens the file picker on click. */
export function FileDrop({ accept, multiple = true, label, hint, onFiles }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptList = accept.split(",").map((s) => s.trim());
  const isAccepted = (file: File) =>
    acceptList.some((a) =>
      a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a || file.name.toLowerCase().endsWith(a),
    );

  function handle(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list).filter(isAccepted);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
        dragging ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent/60 hover:bg-surface-2"
      }`}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Upload className="size-5" />
      </span>
      <span className="font-medium">{label}</span>
      {hint && <span className="text-sm text-muted">{hint}</span>}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
