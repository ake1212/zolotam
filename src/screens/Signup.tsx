import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import {
  BackLink,
  Button,
  Field,
  FieldError,
  GoldRule,
  SelectField,
} from '../components/primitives';
import { PILLARS } from '../data/pillars';

type Draft = {
  name: string;
  email: string;
  phone: string;
  country: string;
  org: string;
  industry: string;
  password: string;
};

const EMPTY: Draft = {
  name: '',
  email: '',
  phone: '',
  country: 'Cameroon',
  org: '',
  industry: '',
  password: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Signup() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError('');
  }

  async function submit() {
    const next: Partial<Record<keyof Draft, string>> = {};
    if (!draft.name.trim()) next.name = 'Tell us your name.';
    if (!EMAIL_RE.test(draft.email.trim())) next.email = 'Enter a valid email address.';
    if (!draft.phone.trim()) next.phone = 'A phone number keeps you reachable.';
    if (!draft.country.trim()) next.country = 'Enter your country.';
    if (!draft.org.trim()) next.org = 'Enter your business or organisation.';
    if (!draft.industry) next.industry = 'Choose the pillar you belong to.';
    if (draft.password.length < 6) next.password = 'Use at least six characters.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    const result = await register(draft);
    setBusy(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate('/pending');
  }

  return (
    <AppShell topSpacer>
      <form
        style={{ padding: '0 28px 36px' }}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <BackLink onClick={() => navigate('/')} style={{ marginBottom: 34 }} />
        <GoldRule />
        <h1
          style={{
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: '-0.033em',
            color: 'var(--ink)',
            margin: '0 0 10px',
          }}
        >
          Apply to join.
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-50)', margin: '0 0 34px' }}>
          Every member is reviewed before listing. Seven fields, two minutes.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Field
            label="FULL NAME"
            value={draft.name}
            onChange={(v) => set('name', v)}
            placeholder="Your name"
            autoComplete="name"
            error={errors.name}
          />
          <Field
            label="EMAIL"
            type="email"
            value={draft.email}
            onChange={(v) => set('email', v)}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
          />
          <Field
            label="PHONE"
            type="tel"
            value={draft.phone}
            onChange={(v) => set('phone', v)}
            placeholder="+237 6XX XXX XXX"
            autoComplete="tel"
            error={errors.phone}
          />
          <Field
            label="COUNTRY"
            value={draft.country}
            onChange={(v) => set('country', v)}
            autoComplete="country-name"
            error={errors.country}
          />
          <Field
            label="ORGANIZATION"
            value={draft.org}
            onChange={(v) => set('org', v)}
            placeholder="Business name"
            autoComplete="organization"
            error={errors.org}
          />
          <SelectField
            label="PILLAR"
            value={draft.industry}
            onChange={(v) => set('industry', v)}
            options={PILLARS}
            placeholder="Select a pillar"
            error={errors.industry}
          />
          <Field
            label="PASSWORD"
            type="password"
            value={draft.password}
            onChange={(v) => set('password', v)}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password}
          />
        </div>

        {formError ? <div style={{ marginTop: 22 }}><FieldError>{formError}</FieldError></div> : null}

        <Button type="submit" disabled={busy} style={{ margin: '38px 0 20px' }}>
          {busy ? 'Sending…' : 'Submit application'}
        </Button>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-50)' }}>
          Already a member?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              color: 'var(--ink)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            Sign in
          </button>
        </div>
      </form>
    </AppShell>
  );
}
