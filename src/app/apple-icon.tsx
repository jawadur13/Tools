import { ImageResponse } from "next/og";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS adds its own rounded corners, so the tile fills the whole square.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: site.colors.accent }}>
        <Logo size={180} bg={site.colors.accent} fg="#ffffff" />
      </div>
    ),
    size,
  );
}
