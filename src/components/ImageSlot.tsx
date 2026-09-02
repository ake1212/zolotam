import { useId } from 'react';
import type { CSSProperties } from 'react';

/**
 * A drop / tap target that reads a local file into a data URL for preview.
 * Nothing is uploaded — real storage arrives with the backend.
 */
export function ImageSlot({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  placeholder: string;
  style?: CSSProperties;
}) {
  const inputId = useId();

  function read(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  return (
    <div
      style={{
        position: 'relative',
        border: '1px solid var(--rule-strong)',
        background: value ? 'var(--panel)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        read(e.dataTransfer.files?.[0]);
      }}
    >
      {value ? (
        <>
          <img
            src={value}
            alt={placeholder}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <button
            type="button"
            aria-label={`Remove ${placeholder.toLowerCase()}`}
            onClick={() => onChange(null)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 18,
              height: 18,
              lineHeight: 1,
              border: 'none',
              background: 'rgba(20,18,15,0.75)',
              color: 'var(--paper)',
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ×
          </button>
        </>
      ) : (
        <label
          htmlFor={inputId}
          className="press"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: 'var(--ink-40)',
          }}
        >
          {placeholder.toUpperCase()}
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(e) => {
          read(e.target.files?.[0]);
          e.target.value = '';
        }}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
