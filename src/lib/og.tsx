import { ImageResponse } from "next/og";
import { Logo } from "@/components/Logo";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };

type Props = { eyebrow?: string; title: string; subtitle: string };

/** Shared 1200×630 social card used by the site-wide and per-tool OG images. */
export function ogImage({ eyebrow, title, subtitle }: Props) {
  const { accent, highlight, ink, paper } = site.colors;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: paper,
          backgroundImage: `radial-gradient(circle at 100% 0%, ${accent}33 0%, transparent 55%)`,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Logo size={72} bg={accent} fg="#ffffff" />
          <div style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 999,
                background: `${highlight}33`,
                color: "#7a4700",
                fontSize: 26,
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize: title.length > 24 ? 72 : 88, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ fontSize: 34, color: "#5d5d73", maxWidth: 980 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#5d5d73" }}>
          <div style={{ display: "flex", color: accent, fontWeight: 600 }}>Runs in your browser · Nothing uploaded</div>
          <div style={{ display: "flex" }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
