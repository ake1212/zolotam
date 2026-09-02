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
      className="tile"
      style={{
        position: 'relative',
        border: value ? '1px solid var(--surface-edge)' : '1.5px dashed rgba(20,18,15,0.22)',
        borderRadius: 'var(--r-md)',
        background: value ? 'var(--panel)' : 'var(--surface)',
        boxShadow: value ? 'var(--shadow-sm)' : 'none',
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
              top: 5,
              right: 5,
              width: 20,
              height: 20,
              borderRadius: 'var(--r-pill)',
              lineHeight: 1,
              border: 'none',
              background: 'rgba(20,18,15,0.78)',
              color: 'var(--paper)',
              fontSize: 12,
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
