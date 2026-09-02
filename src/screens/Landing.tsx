import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Button } from '../components/primitives';

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--paper)', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 9.5,
          color: 'var(--paper-45)',
          letterSpacing: '0.16em',
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const divider = { width: 1, background: 'var(--paper-rule)' };

export function Landing() {
  const navigate = useNavigate();
  const { memberCount, loginAsAdmin } = useApp();

  return (
    <div className="backdrop">
      <div className="device" style={{ background: 'var(--ink)' }}>
        <div
          className="deviceScroll"
          style={{ display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}
        >
          <div
            style={{
              padding: 'calc(var(--safe-top) + 70px) 30px 0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 'auto' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-xs)',
                  border: '1px solid rgba(246,242,234,0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--paper)',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                }}
              >
                M
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(246,242,234,0.55)',
                  letterSpacing: '0.22em',
                }}
              >
                MARKETPLACE UNLIMITED
              </div>
            </div>

            <div style={{ padding: '56px 0 0' }}>
              <div style={{ width: 28, height: 1, background: 'var(--gold)', marginBottom: 26 }} />
              <h1
                style={{
                  fontSize: 40,
                  lineHeight: 1.03,
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  color: 'var(--paper)',
                  margin: '0 0 18px',
                  textWrap: 'pretty',
                }}
              >
                A marketplace
                <br />
                built on trust.
              </h1>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: 'var(--paper-60)',
                  margin: '0 0 40px',
                  maxWidth: 280,
                  textWrap: 'pretty',
                }}
              >
                Visibility for Cameroonian businesses and the diaspora. Sixteen pillars. One vetted
                network.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 34, paddingBottom: 38 }}>
              <Stat value="16" label="PILLARS" />
              <div style={divider} />
              <Stat value={memberCount.toLocaleString('en-US')} label="MEMBERS" />
              <div style={divider} />
              <Stat value="Vetted" label="ADMISSION" />
            </div>
          </div>

          <div style={{ padding: '0 30px calc(var(--safe-bottom) + 34px)', flexShrink: 0 }}>
            <Button variant="paper" onClick={() => navigate('/browse')} style={{ marginBottom: 10 }}>
              Enter the marketplace
            </Button>
            <Button
              variant="outlineDark"
              onClick={() => navigate('/signup')}
              style={{ marginBottom: 22 }}
            >
              Apply for membership
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  color: 'rgba(246,242,234,0.75)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                Member log in
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin');
                }}
                style={{
                  fontSize: 11,
                  color: 'rgba(246,242,234,0.3)',
                  letterSpacing: '0.08em',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                ADMIN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
