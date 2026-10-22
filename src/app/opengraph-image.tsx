import { ogImage, ogSize } from "@/lib/og";
import { site } from "@/lib/site";
import { tools } from "@/tools/registry";

export const alt = `${site.name} — ${site.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: `${tools.length} free tools`,
    title: site.tagline,
    subtitle: "Compress images, merge PDFs, make QR codes and more — free, fast and private.",
  });
}
