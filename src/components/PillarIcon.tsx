import type { CSSProperties, JSX } from 'react';

/**
 * One line-drawn glyph per pillar, indexed 0–15 to match PILLARS order.
 * Ported verbatim from the PillarIcon design component.
 */
const GLYPHS: Array<(stroke: string) => JSX.Element> = [
  // 0 Building Materials
  () => (
    <>
      <rect x="5" y="10" width="14" height="10" />
      <path d="M4 10l8-6 8 6" />
      <rect x="10" y="15" width="4" height="5" />
    </>
  ),
  // 1 Electronics
  () => (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1" />
      <line x1="9" y1="19" x2="15" y2="19" />
      <line x1="12" y1="15" x2="12" y2="19" />
    </>
  ),
  // 2 Automobiles
  () => (
    <>
      <path d="M4 15h16l-2-4H6z" />
      <circle cx="8" cy="17" r="1.5" />
      <circle cx="16" cy="17" r="1.5" />
    </>
  ),
  // 3 Fashion & Beauty
  () => (
    <>
      <circle cx="12" cy="4" r="1.3" />
      <path d="M12 6l-9 6h18z" />
    </>
  ),
  // 4 Food & Catering
  () => (
    <>
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="4" y1="3" x2="4" y2="9" />
      <line x1="8" y1="3" x2="8" y2="9" />
      <line x1="18" y1="3" x2="18" y2="21" />
    </>
  ),
  // 5 Real Estate
  () => (
    <>
      <path d="M4 11l8-6 8 6" />
      <rect x="6" y="11" width="12" height="9" />
    </>
  ),
  // 6 Home Services
  () => (
    <>
      <line x1="6" y1="18" x2="18" y2="6" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
    </>
  ),
  // 7 Health & Wellness
  () => (
    <>
      <rect x="10" y="4" width="4" height="16" rx="1" />
      <rect x="4" y="10" width="16" height="4" rx="1" />
    </>
  ),
  // 8 Agriculture
  () => (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <path d="M12 10l-6-2M12 10l6-2" />
    </>
  ),
  // 9 Transport & Logistics
  () => (
    <>
      <rect x="3" y="9" width="10" height="7" />
      <path d="M13 12h4l3 3v1h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="16" cy="18" r="1.5" />
    </>
  ),
  // 10 Professional Services
  () => (
    <>
      <rect x="3" y="8" width="18" height="11" rx="1" />
      <path d="M8 8V6h8v2" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </>
  ),
  // 11 Education
  () => (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <line x1="6" y1="11" x2="6" y2="15" />
    </>
  ),
  // 12 Events & Entertainment
  () => (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  // 13 Finance
  () => (
    <>
      <rect x="4" y="12" width="4" height="8" />
      <rect x="10" y="7" width="4" height="13" />
      <rect x="16" y="3" width="4" height="17" />
    </>
  ),
  // 14 Arts & Crafts
  (stroke) => (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9" cy="10" r="1.1" fill={stroke} />
      <circle cx="12" cy="8" r="1.1" fill={stroke} />
      <circle cx="15" cy="10" r="1.1" fill={stroke} />
    </>
  ),
  // 15 Tourism & Hospitality
  () => (
    <>
      <rect x="4" y="8" width="16" height="12" rx="1" />
      <path d="M9 8V6h6v2" />
      <line x1="4" y1="14" x2="20" y2="14" />
    </>
  ),
];

interface Props {
  index: number;
  color?: string;
  size?: number | string;
  style?: CSSProperties;
}

export function PillarIcon({ index, color = '#ffffff', size = 22, style }: Props) {
  const glyph = GLYPHS[index] ?? GLYPHS[0];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyph(color)}
      </g>
    </svg>
  );
}
