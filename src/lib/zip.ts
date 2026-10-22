import { downloadBlob } from "./files";

export type ZipEntry = { name: string; blob: Blob };

/** Makes names unique inside the archive: "a.png", "a (2).png", ... */
function uniqueNames(entries: ZipEntry[]): string[] {
  const seen = new Map<string, number>();
  return entries.map(({ name }) => {
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    if (count === 1) return name;
    const dot = name.lastIndexOf(".");
    return dot > 0 ? `${name.slice(0, dot)} (${count})${name.slice(dot)}` : `${name} (${count})`;
  });
}

/**
 * Downloads several files as one ZIP, or the file itself when there is only one.
 * Entries are stored uncompressed: images and PDFs are already compressed.
 */
export async function downloadAsZip(entries: ZipEntry[], zipName: string) {
  if (entries.length === 0) return;
  if (entries.length === 1) {
    downloadBlob(entries[0].blob, entries[0].name);
    return;
  }
  const { zip } = await import("fflate");
  const names = uniqueNames(entries);
  const files: Record<string, [Uint8Array, { level: 0 }]> = {};
  await Promise.all(
    entries.map(async (e, i) => {
      files[names[i]] = [new Uint8Array(await e.blob.arrayBuffer()), { level: 0 }];
    }),
  );
  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(files, (err, out) => (err ? reject(err) : resolve(out))),
  );
  downloadBlob(new Blob([data as BlobPart], { type: "application/zip" }), zipName);
}
