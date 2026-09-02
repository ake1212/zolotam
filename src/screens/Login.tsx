import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { BackLink, Button, Field, FieldError, GoldRule } from '../components/primitives';

export function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    if (result.user.role === 'admin') navigate('/admin');
    else if (result.user.status === 'pending') navigate('/pending');
    else navigate('/dashboard');
  }

  return (
    <AppShell topSpacer>
      <form
        style={{ padding: '0 28px 32px' }}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <BackLink onClick={() => navigate('/')} style={{ marginBottom: 44 }} />
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
          Welcome back.
        </h1>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-50)', margin: '0 0 36px' }}>
          Sign in to manage your listings and contacts.
        </p>

        <Field
          label="EMAIL"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError('');
          }}
          placeholder="you@example.com"
          style={{ marginBottom: 24 }}
        />
        <Field
          label="PASSWORD"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError('');
          }}
          placeholder="••••••••"
          style={{ marginBottom: 14 }}
        />

        {error ? <FieldError>{error}</FieldError> : null}

        <div style={{ textAlign: 'right', margin: '14px 0 30px' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-45)' }}>Forgot password?</span>
        </div>

        <Button type="submit" style={{ marginBottom: 20 }}>
          Sign in
        </Button>

        <div
          style={{
            fontSize: 11,
            lineHeight: 1.8,
            color: 'var(--ink-40)',
            background: 'var(--surface)',
            border: '1px solid var(--surface-edge)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: '14px 16px',
            marginBottom: 22,
          }}
        >
          <div style={{ letterSpacing: '0.14em', fontWeight: 600, marginBottom: 6 }}>DEMO ACCESS</div>
          Member — adaeze@example.com / member
          <br />
          Admin — admin@mpuglobal.com / admin
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-50)' }}>
          Not a member yet?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
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
            Apply
          </button>
        </div>
      </form>
    </AppShell>
  );
}
