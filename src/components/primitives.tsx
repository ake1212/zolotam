import type { CSSProperties, ReactNode } from 'react';

/* ── Type styles lifted from the design ─────────────────────────────── */

export const eyebrow: CSSProperties = {
  fontSize: 9.5,
  fontWeight: 600,
  color: 'var(--ink-45)',
  letterSpacing: '0.16em',
};

export const displayHeading: CSSProperties = {
  fontWeight: 600,
  letterSpacing: '-0.032em',
  color: 'var(--ink)',
  margin: 0,
};

/** The 28×1 gold rule that opens most screens. */
export function GoldRule({ width = 24, mb = 20 }: { width?: number; mb?: number }) {
  return <div style={{ width, height: 1, background: 'var(--gold)', marginBottom: mb }} />;
}

/** Small caps label followed by a hairline that fills the row. */
export function SectionRule({ label, mb = 16 }: { label: string; mb?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: mb }}>
      <div style={{ ...eyebrow, letterSpacing: '0.2em' }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'rgba(20,18,15,0.1)' }} />
    </div>
  );
}

/** Standalone small caps label (no rule). */
export function SectionLabel({ children, mb = 12 }: { children: ReactNode; mb?: number }) {
  return <div style={{ ...eyebrow, letterSpacing: '0.18em', color: 'var(--ink-42)', marginBottom: mb }}>{children}</div>;
}

/* ── Navigation ─────────────────────────────────────────────────────── */

export function BackLink({
  onClick,
  label = 'BACK',
  dark = false,
  style,
}: {
  onClick: () => void;
  label?: string;
  dark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        ...style,
      }}
    >
      <span style={{ fontSize: 15, color: dark ? 'var(--paper)' : 'var(--ink)', lineHeight: 1 }}>←</span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: dark ? 'rgba(246,242,234,0.6)' : 'var(--ink-50)',
          letterSpacing: '0.14em',
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ── Buttons ────────────────────────────────────────────────────────── */

type ButtonVariant = 'ink' | 'paper' | 'gold' | 'outline' | 'outlineDark';

const VARIANTS: Record<ButtonVariant, CSSProperties> = {
  ink: {
    background: 'var(--ink)',
    color: 'var(--paper)',
    border: 'none',
    fontWeight: 600,
    boxShadow: 'var(--shadow-sm)',
  },
  paper: {
    background: 'var(--paper)',
    color: 'var(--ink)',
    border: 'none',
    fontWeight: 600,
    boxShadow: '0 2px 14px rgba(0,0,0,0.22)',
  },
  gold: {
    background: 'var(--gold)',
    color: 'var(--ink)',
    border: 'none',
    fontWeight: 600,
    boxShadow: 'var(--shadow-sm)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1px solid rgba(20,18,15,0.25)',
    fontWeight: 500,
  },
  outlineDark: {
    background: 'transparent',
    color: 'var(--paper)',
    border: '1px solid rgba(246,242,234,0.3)',
    fontWeight: 500,
  },
};

export function Button({
  children,
  onClick,
  variant = 'ink',
  disabled = false,
  type = 'button',
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="press"
      style={{
        width: '100%',
        padding: 17,
        fontSize: 14.5,
        letterSpacing: '-0.01em',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        borderRadius: 'var(--r-sm)',
        ...VARIANTS[variant],
        ...(disabled
          ? {
              background: 'rgba(20,18,15,0.22)',
              color: 'var(--paper)',
              border: 'none',
              boxShadow: 'none',
            }
          : null),
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Form fields ────────────────────────────────────────────────────── */

const fieldClass = (error?: string) => `field${error ? ' field--error' : ''}`;

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'url';
  autoComplete?: string;
  error?: string;
  style?: CSSProperties;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  error,
  style,
}: FieldProps) {
  return (
    <div style={style}>
      <label style={{ ...eyebrow, display: 'block', marginBottom: 9 }}>{label}</label>
      <input
        className={fieldClass(error)}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: Omit<FieldProps, 'type' | 'autoComplete'> & { rows?: number }) {
  return (
    <div>
      <label style={{ ...eyebrow, display: 'block', marginBottom: 9 }}>{label}</label>
      <textarea
        className={fieldClass(error)}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, display: 'block' }}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select',
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label style={{ ...eyebrow, display: 'block', marginBottom: 9 }}>{label}</label>
      <div className="select-wrap">
        <select
          className={fieldClass(error)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            paddingRight: 40,
            color: value ? 'var(--ink)' : 'rgba(20,18,15,0.32)',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      {error ? <FieldError>{error}</FieldError> : null}
    </div>
  );
}

export function FieldError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" style={{ fontSize: 11.5, color: 'var(--gold-deep)', marginTop: 8 }}>
      {children}
    </div>
  );
}

/** The gold ✦ used for verification and confirmation moments. */
export function Mark({ size = 16 }: { size?: number }) {
  return <span style={{ fontSize: size, color: 'var(--gold)' }}>✦</span>;
}

export function MarkFrame() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        border: '1px solid var(--gold)',
        borderRadius: 'var(--r-md)',
        background: 'rgba(168,129,58,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Mark />
    </div>
  );
}

/** Small caps status chip. */
export function Chip({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'gold';
}) {
  const gold = tone === 'gold';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 13px',
        border: `1px solid ${gold ? 'rgba(168,129,58,0.45)' : 'var(--rule-strong)'}`,
        background: gold ? 'rgba(168,129,58,0.09)' : 'var(--surface)',
        borderRadius: 'var(--r-pill)',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: gold ? 'var(--gold-deep)' : 'rgba(20,18,15,0.6)',
      }}
    >
      {children}
    </span>
  );
}

/** Raised panel: the standard container for a group of related content. */
export function Card({
  children,
  padding = 18,
  style,
}: {
  children: ReactNode;
  padding?: number | string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--surface-edge)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Dark tile that stands in for listing imagery, with the gold top hairline. */
export function ArtTile({
  children,
  height,
  width,
  rule = false,
  radius = 'var(--r-sm)',
  style,
}: {
  children: ReactNode;
  height: number | string;
  width?: number | string;
  rule?: boolean;
  radius?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--panel)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: radius,
        ...style,
      }}
    >
      {rule ? (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold)' }} />
      ) : null}
      {children}
    </div>
  );
}
