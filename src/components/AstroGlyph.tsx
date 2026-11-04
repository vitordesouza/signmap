import type { ReactNode, SVGProps } from "react";
/** Original vector symbols. No font, external sprite, or platform emoji dependency. */
const paths: Record<string, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  moon: <path d="M16 3a9 9 0 1 0 0 18A10 10 0 0 1 16 3Z" />,
  mercury: (
    <>
      <circle cx="12" cy="10" r="4.5" />
      <path d="M7.5 2a4.5 4.5 0 0 0 9 0M12 14.5V22M8 18.5h8" />
    </>
  ),
  venus: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M12 13v9M8 18h8" />
    </>
  ),
  mars: (
    <>
      <circle cx="9" cy="15" r="6" />
      <path d="m13.3 10.7 8-8M15 2.7h6.3V9" />
    </>
  ),
  jupiter: <path d="M8 3c0 6-2 7-5 10h16M15 3v19" />,
  saturn: <path d="M8 2v17M4 6h8M8 12c7-7 12-1 6 5-3 3-1 5 2 4" />,
  uranus: (
    <>
      <path d="M4 3v11M20 3v11M4 8h16M12 2v14" />
      <circle cx="12" cy="19" r="3" />
    </>
  ),
  neptune: (
    <>
      <path d="M5 3v5a7 7 0 0 0 14 0V3M12 2v20M8 18h8M2 5l3-3 3 3M16 5l3-3 3 3" />
    </>
  ),
  pluto: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M5 6a7 7 0 0 0 14 0M12 13v9M8 18h8" />
    </>
  ),
  chiron: (
    <>
      <circle cx="12" cy="18" r="4" />
      <path d="M12 14V2m0 5 7-5m-7 5 7 5" />
    </>
  ),
  lilith: (
    <>
      <path d="M15 2a6 6 0 1 0 0 11 7 7 0 0 1 0-11ZM12 14v8M8 18h8" />
    </>
  ),
  northNode: (
    <>
      <path d="M5 17V9a7 7 0 0 1 14 0v8" />
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
    </>
  ),
  southNode: (
    <g transform="translate(0 24) scale(1 -1)">
      <path d="M5 17V9a7 7 0 0 1 14 0v8" />
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="18" r="3" />
    </g>
  ),
  fortune: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m6.4 6.4 11.2 11.2m-11.2 0L17.6 6.4" />
    </>
  ),
  rising: <path d="m1 19 4-14 4 14M2.5 14h5M22 7c-8-8-15 16 0 10" />,
  midheaven: <path d="M1 19V5l5 8 5-8v14M23 7c-10-10-16 17 0 10" />,
  descendant: <path d="M1 5v14h2a7 7 0 0 0 0-14H1M23 7c-9-9-16 16 0 10" />,
  ic: <path d="M1 5h7M4.5 5v14M1 19h7M23 7c-10-10-17 17 0 10" />,
  aries: <path d="M12 21V9C12-2-1 1 4 11M12 9c0-11 13-8 8 2" />,
  taurus: (
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M4 2c0 10 16 10 16 0" />
    </>
  ),
  gemini: <path d="M4 2c5 3 11 3 16 0M4 22c5-3 11-3 16 0M8 4v16M16 4v16" />,
  cancer: (
    <>
      <circle cx="7" cy="8" r="3.5" />
      <circle cx="17" cy="16" r="3.5" />
      <path d="M3.5 8c0-6 12-8 17-3M20.5 16c0 6-12 8-17 3" />
    </>
  ),
  leo: (
    <>
      <circle cx="5" cy="17" r="3" />
      <path d="M7 15c8-9-3-11 2-13 7-3 10 4 6 11-6 12 6 12 7 5" />
    </>
  ),
  virgo: <path d="M2 4v15M2 9c0-7 6-7 6 0v10M8 9c0-7 6-7 6 0v10M14 10c8-11 12 4 0 10m0-1 6 3" />,
  libra: <path d="M2 21h20M2 15h6a6 6 0 1 1 8 0h6" />,
  scorpio: <path d="M2 4v15M2 9c0-7 6-7 6 0v10M8 9c0-7 6-7 6 0v7c0 5 5 5 8 2m-4-1 4 1-1 4" />,
  sagittarius: <path d="M3 21 21 3M11 3h10v10M4 10l10 10" />,
  capricorn: (
    <path d="M2 5c4-6 6-2 6 3v8M8 8c0-9 9-7 8 0l-2 10c-1 6-7 5-8 2M15 16c12-11 11 10 1 5l-4-4" />
  ),
  aquarius: <path d="m2 9 4-4 4 4 4-4 4 4 4-4M2 19l4-4 4 4 4-4 4 4 4-4" />,
  pisces: <path d="M5 2c8 5 8 15 0 20M19 2c-8 5-8 15 0 20M2 12h20" />,
};
export const GLYPH_IDS = Object.keys(paths);
export function AstroGlyph({
  id,
  size = 20,
  title,
  ...props
}: Omit<SVGProps<SVGSVGElement>, "id"> & { id: string; size?: number; title?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-astro-glyph={id}
      {...props}
      style={{ width: size, height: size, ...props.style }}
    >
      {title && <title>{title}</title>}
      {paths[id]}
    </svg>
  );
}
