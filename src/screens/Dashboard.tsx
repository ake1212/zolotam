import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { Button, ArtTile } from '../components/primitives';
import { PillarIcon } from '../components/PillarIcon';
import type { Listing } from '../data/types';

function DarkStat({ value, label, gold = false }: { value: string; label: string; gold?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 600,
          color: gold ? 'var(--gold)' : 'var(--paper)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 9, color: 'var(--paper-45)', letterSpacing: '0.14em', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function statusLabel(listing: Listing): string {
  if (listing.status === 'published') return 'PUBLISHED';
  if (listing.status === 'returned') return 'RETURNED FOR CHANGES';
  return 'PENDING REVIEW';
}

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, listingsOwnedBy, memberCount, settings, updateSettings, logout } = useApp();
  const [panel, setPanel] = useState<'' | 'profile' | 'settings'>('');
  const [listingsOpen, setListingsOpen] = useState(false);

  // The route guard in App.tsx keeps this non-null.
  const user = currentUser!;
  const mine = listingsOwnedBy(user.id);
  const live = mine.filter((l) => l.status === 'published').length;
  const pending = mine.filter((l) => l.status === 'pending').length;

  function togglePanel(next: 'profile' | 'settings') {
    setPanel((prev) => (prev === next ? '' : next));
    setListingsOpen(false);
  }

  const rows = [
    {
      key: 'listings',
      label: 'My Listings',
      sub: `${live} live · ${pending} pending review`,
      onClick: () => {
        setListingsOpen((v) => !v);
        setPanel('');
      },
    },
    {
      key: 'profile',
      label: 'My Profile',
      sub: 'Contact details and organisation',
      onClick: () => togglePanel('profile'),
    },
    {
      key: 'browse',
      label: 'Browse MPUGLOBAL',
      sub: `Sixteen pillars, ${memberCount.toLocaleString('en-US')} members`,
      onClick: () => navigate('/browse'),
    },
    {
      key: 'settings',
      label: 'Account Settings',
      sub: 'Notifications, language, visibility',
      onClick: () => togglePanel('settings'),
    },
  ];

  return (
    <AppShell showTabBar>
      <div
        style={{
          background: 'var(--ground)',
          padding: 'calc(var(--safe-top) + 72px) 24px 28px',
          borderBottomLeftRadius: 'var(--r-lg)',
          borderBottomRightRadius: 'var(--r-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                color: 'var(--paper-45)',
                letterSpacing: '0.18em',
                marginBottom: 9,
              }}
            >
              MEMBER SINCE {user.memberSince}
            </div>
            <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--paper)', letterSpacing: '-0.03em' }}>
              {user.name}
            </div>
          </div>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: '1px solid rgba(168,129,58,0.6)',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 28,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--paper-rule)',
          }}
        >
          <DarkStat value={String(mine.length)} label="LISTINGS" />
          <DarkStat value="48" label="VIEWS · 7D" />
          <DarkStat value="6" label="ENQUIRIES" gold />
        </div>
      </div>

      <div style={{ padding: '22px 24px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="gold" onClick={() => navigate('/dashboard/new')} style={{ marginBottom: 18 }}>
          +&nbsp;&nbsp;Create a new listing
        </Button>

        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--surface-edge)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={row.onClick}
              className="press"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 16px',
                cursor: 'pointer',
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    letterSpacing: '-0.015em',
                  }}
                >
                  {row.label}
                </span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-45)', marginTop: 3 }}>
                  {row.sub}
                </span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-30)' }}>→</span>
            </button>

            {row.key === 'profile' && panel === 'profile' ? (
              <div
                style={{
                  padding: '14px 16px 18px',
                  borderTop: '1px solid var(--rule)',
                  fontSize: 13,
                  color: 'rgba(20,18,15,0.6)',
                  lineHeight: 1.9,
                  whiteSpace: 'pre-line',
                }}
              >
                {[user.name, user.email, user.phone, user.org, `${user.industry} · ${user.country}`].join(
                  '\n',
                )}
              </div>
            ) : null}

            {row.key === 'settings' && panel === 'settings' ? (
              <div style={{ padding: '6px 16px 14px', borderTop: '1px solid var(--rule)' }}>
                <SettingRow
                  label="Notifications"
                  value={settings.notifications ? 'On' : 'Off'}
                  onClick={() => updateSettings({ notifications: !settings.notifications })}
                />
                <SettingRow
                  label="Language"
                  value={settings.language}
                  onClick={() =>
                    updateSettings({ language: settings.language === 'English' ? 'Français' : 'English' })
                  }
                />
                <SettingRow
                  label="Profile visibility"
                  value={settings.publicProfile ? 'Public' : 'Members only'}
                  onClick={() => updateSettings({ publicProfile: !settings.publicProfile })}
                />
                <button
                  type="button"
                  // Clearing the session is enough: MemberRoute returns the
                  // visitor to the landing page on the next render.
                  onClick={logout}
                  className="press"
                  style={{
                    marginTop: 14,
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    fontWeight: 600,
                    color: 'var(--gold-deep)',
                    background: 'transparent',
                    border: '1px solid rgba(141,108,46,0.35)',
                    borderRadius: 'var(--r-pill)',
                    padding: '9px 18px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  SIGN OUT
                </button>
              </div>
            ) : null}

            {row.key === 'listings' && listingsOpen ? (
              <div style={{ padding: '0 16px 6px', borderTop: '1px solid var(--rule)' }}>
                {mine.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => navigate(`/listing/${l.id}`)}
                    className="press"
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      padding: '14px 0',
                      cursor: 'pointer',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <ArtTile width={48} height={48}>
                      {l.logo ? (
                        <img
                          src={l.logo}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <PillarIcon index={l.pillarIdx} color="rgba(168,129,58,0.9)" size={20} />
                      )}
                    </ArtTile>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: 'var(--ink)',
                          letterSpacing: '-0.015em',
                        }}
                      >
                        {l.name}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 11,
                          color: 'var(--ink-45)',
                          marginTop: 3,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {statusLabel(l)}
                      </span>
                    </span>
                  </button>
                ))}
                {mine.length === 0 ? (
                  <div style={{ padding: '22px 0', fontSize: 13, color: 'var(--ink-40)' }}>
                    You have no listings yet.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function SettingRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '11px 0',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--ink-50)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
    </button>
  );
}
