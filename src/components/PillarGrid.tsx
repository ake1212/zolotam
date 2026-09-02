import { PILLARS } from '../data/pillars';
import { PillarIcon } from './PillarIcon';

/**
 * The 4×4 pillar table as separated, raised tiles. Selecting one inverts it to
 * ink with a gold glyph.
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
        gap: 7,
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
            className="press tile"
            style={{
              background: selected ? 'var(--ink)' : 'var(--surface)',
              border: `1px solid ${selected ? 'var(--ink)' : 'var(--surface-edge)'}`,
              borderRadius: 'var(--r-sm)',
              boxShadow: selected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              padding: '13px 3px 11px',
              minHeight: 78,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <PillarIcon index={idx} color={selected ? 'var(--gold)' : 'var(--ink)'} size={22} />
            <span
              style={{
                fontSize: 8.5,
                textAlign: 'center',
                lineHeight: 1.25,
                color: selected ? 'rgba(246,242,234,0.82)' : 'var(--ink-72)',
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
