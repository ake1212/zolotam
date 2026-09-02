import { SearchGlass } from './SearchGlass';

/**
 * A raised search well. The glass sits inside the field so the whole control
 * reads as one object rather than an icon next to a line.
 */
export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder,
  trailing,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      className="field"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        height: 48,
      }}
    >
      <SearchGlass size={15} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) onSubmit();
        }}
        enterKeyHint="search"
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          background: 'transparent',
          fontSize: 14,
          color: 'var(--ink)',
          outline: 'none',
          padding: 0,
        }}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          style={{
            border: 'none',
            background: 'none',
            padding: 4,
            margin: 0,
            cursor: 'pointer',
            fontSize: 15,
            lineHeight: 1,
            color: 'var(--ink-40)',
          }}
        >
          ×
        </button>
      ) : null}
      {trailing}
    </div>
  );
}
