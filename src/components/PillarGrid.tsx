import { PILLARS } from '../data/pillars';
import { PillarIcon } from './PillarIcon';

/**
 * The 4×4 pillar table. The 1px grid gap doubles as the hairline rule —
 * the container's background shows through between cells.
 */
export function PillarGrid({
  onSelect,
  selectedIdx = null,
  style,
}: {
  onSelect: (idx: number) => void;
  selectedIdx?: number | null;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'var(--rule)',
        ...style,
      }}
    >
      {PILLARS.map((name, idx) => {
        const selected = selectedIdx === idx;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(idx)}
            aria-pressed={selectedIdx === null ? undefined : selected}
            className="press"
            style={{
              background: selected ? 'var(--ink)' : 'var(--paper)',
              padding: '14px 4px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 9,
              cursor: 'pointer',
              border: 'none',
              font: 'inherit',
            }}
          >
            <PillarIcon index={idx} color={selected ? 'var(--gold)' : 'var(--ink)'} size={22} />
            <span
              style={{
                fontSize: 8.5,
                textAlign: 'center',
                lineHeight: 1.25,
                color: selected ? 'rgba(246,242,234,0.8)' : 'var(--ink-72)',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
