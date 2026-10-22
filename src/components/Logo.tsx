type Props = {
  size?: number;
  /** Tile color; defaults to the theme accent. */
  bg?: string;
  /** Toolbox color; defaults to the accent foreground. */
  fg?: string;
  className?: string;
};

/**
 * The Toolbox mark: a toolbox on a rounded tile. Plain SVG with explicit
 * fills so it also renders inside ImageResponse (OG images, apple icon).
 */
export function Logo({ size = 32, bg = "var(--accent)", fg = "var(--accent-fg)", className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <rect width="32" height="32" rx="8" fill={bg} />
      <path
        d="M12.5 11.5V9.75c0-.97.78-1.75 1.75-1.75h3.5c.97 0 1.75.78 1.75 1.75v1.75"
        stroke={fg}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="6.5" y="11.5" width="19" height="13" rx="2.5" fill={fg} />
      <rect x="6.5" y="16.25" width="19" height="1.5" fill={bg} />
      <rect x="14" y="14.75" width="4" height="4.5" rx="1" fill={bg} />
    </svg>
  );
}
