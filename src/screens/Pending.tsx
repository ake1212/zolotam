import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { Button, Chip, MarkFrame } from '../components/primitives';
import { DEMO_MEMBER_ID } from '../data/seed';

export function Pending() {
  const navigate = useNavigate();
  const { login, users } = useApp();

  /** Demo shortcut: step into the approved-member experience. */
  function previewApproved() {
    const demo = users.find((u) => u.id === DEMO_MEMBER_ID);
    if (demo) login(demo.email, demo.password);
    navigate('/dashboard');
  }

  return (
    <AppShell topSpacer>
      <div style={{ padding: '64px 30px 32px' }}>
        <div style={{ marginBottom: 30 }}>
          <MarkFrame />
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.032em',
            color: 'var(--ink)',
            margin: '0 0 14px',
            lineHeight: 1.15,
          }}
        >
          Application
          <br />
          received.
        </h1>
        <div style={{ marginBottom: 24 }}>
          <Chip tone="gold">UNDER REVIEW</Chip>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-55)', margin: '0 0 40px' }}>
          Our team reviews every application by hand — usually within two business days. You'll
          receive an email the moment your membership opens.
        </p>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-edge)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: 18,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              color: 'var(--ink-40)',
              letterSpacing: '0.18em',
              marginBottom: 12,
            }}
          >
            WHILE YOU WAIT
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(20,18,15,0.65)', lineHeight: 1.7 }}>
            Browse the sixteen pillars, shortlist the suppliers you want to reach, and prepare your
            listing photos.
          </div>
        </div>

        <Button onClick={() => navigate('/browse')} style={{ marginBottom: 18 }}>
          Browse the marketplace
        </Button>
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={previewApproved}
            style={{
              fontSize: 11,
              color: 'rgba(20,18,15,0.35)',
              letterSpacing: '0.06em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Preview the approved-member experience
          </button>
        </div>
      </div>
    </AppShell>
  );
}
