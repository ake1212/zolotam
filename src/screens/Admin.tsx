import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { PillarIcon } from '../components/PillarIcon';
import { ArtTile, BackLink } from '../components/primitives';
import { PILLARS, pillarName } from '../data/pillars';

type Tab = 'users' | 'listings' | 'pillars';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'users', label: 'USERS' },
  { key: 'listings', label: 'LISTINGS' },
  { key: 'pillars', label: 'PILLARS' },
];

function AdminStat({ value, label, gold = false }: { value: string; label: string; gold?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'var(--surface-dark)',
        border: '1px solid rgba(246,242,234,0.08)',
        borderRadius: 'var(--r-sm)',
        padding: '13px 12px',
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: gold ? 'var(--gold)' : 'var(--paper)',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: 8.5, color: 'rgba(246,242,234,0.5)', letterSpacing: '0.14em', marginTop: 4 }}
      >
        {label}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  primary = false,
  small = false,
}: {
  children: string;
  onClick: () => void;
  primary?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press"
      style={{
        padding: small ? '8px 17px' : '9px 19px',
        background: primary ? 'var(--ground)' : 'transparent',
        border: primary ? '1px solid var(--ground)' : '1px solid rgba(20,18,15,0.22)',
        borderRadius: 'var(--r-pill)',
        color: primary ? 'var(--paper)' : 'rgba(20,18,15,0.7)',
        fontSize: small ? 11 : 11.5,
        fontWeight: primary ? 600 : 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

export function Admin() {
  const navigate = useNavigate();
  const {
    pendingUsers,
    pendingListings,
    pillarCounts,
    memberCount,
    approveUser,
    rejectUser,
    publishListing,
    returnListing,
    logout,
  } = useApp();
  const [tab, setTab] = useState<Tab>('users');

  /** Published listings in a pillar, counted by the database. */
  function countFor(idx: number): number {
    return pillarCounts[idx] ?? 0;
  }

  return (
    <AppShell>
      <div
        style={{
          background: 'var(--ground)',
          padding: 'calc(var(--safe-top) + 68px) 24px 24px',
          borderBottomLeftRadius: 'var(--r-lg)',
          borderBottomRightRadius: 'var(--r-lg)',
        }}
      >
        <BackLink
          dark
          label="EXIT"
          // Clearing the session is enough: AdminRoute returns the visitor to
          // the landing page on the next render.
          onClick={logout}
          style={{ marginBottom: 20 }}
        />
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 600,
            color: 'rgba(168,129,58,0.9)',
            letterSpacing: '0.2em',
            marginBottom: 8,
          }}
        >
          CONTROL ROOM
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: 'var(--paper)',
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}
        >
          Administration
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <AdminStat value={String(pendingUsers.length)} label="USERS PENDING" gold />
          <AdminStat value={String(pendingListings.length)} label="LISTINGS PENDING" gold />
          <AdminStat value={memberCount.toLocaleString('en-US')} label="MEMBERS" />
        </div>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        <div
          style={{
            display: 'flex',
            gap: 24,
            borderBottom: '1px solid rgba(20,18,15,0.1)',
            marginBottom: 22,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: '16px 0 13px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                color: tab === t.key ? 'var(--ink)' : 'var(--ink-40)',
                marginBottom: -1,
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t.key ? 'var(--ink)' : 'transparent'}`,
                fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' ? (
          <>
            {pendingUsers.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: 16,
                  marginBottom: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-edge)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    fontWeight: 600,
                    color: 'var(--ink-40)',
                    letterSpacing: '0.16em',
                    marginBottom: 7,
                  }}
                >
                  {u.industry.toUpperCase()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.018em' }}>
                  {u.name}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-55)', margin: '3px 0 2px' }}>{u.org}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-40)', marginBottom: 14 }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionButton primary onClick={() => approveUser(u.id)}>
                    Approve
                  </ActionButton>
                  <ActionButton onClick={() => rejectUser(u.id)}>Decline</ActionButton>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 ? <QueueClear /> : null}
          </>
        ) : null}

        {tab === 'listings' ? (
          <>
            {pendingListings.map((l) => (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: 16,
                  marginBottom: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--surface-edge)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <ArtTile width={52} height={52}>
                  {l.logo ? (
                    <img src={l.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <PillarIcon index={l.pillarIdx} color="rgba(168,129,58,0.9)" size={20} />
                  )}
                </ArtTile>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.018em' }}
                  >
                    {l.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-50)', margin: '3px 0 12px' }}>
                    {pillarName(l.pillarIdx)} · {l.city}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ActionButton small primary onClick={() => publishListing(l.id)}>
                      Publish
                    </ActionButton>
                    <ActionButton small onClick={() => returnListing(l.id)}>
                      Return
                    </ActionButton>
                    <ActionButton small onClick={() => navigate(`/listing/${l.id}`)}>
                      View
                    </ActionButton>
                  </div>
                </div>
              </div>
            ))}
            {pendingListings.length === 0 ? <QueueClear /> : null}
          </>
        ) : null}

        {tab === 'pillars' ? (
          <>
            {PILLARS.map((name, idx) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 0',
                  borderBottom: '1px solid rgba(20,18,15,0.08)',
                }}
              >
                <PillarIcon index={idx} color="var(--ink)" size={18} />
                <div
                  style={{
                    flex: 1,
                    fontSize: 13.5,
                    color: 'var(--ink)',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {name}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/search?pillar=${idx}`)}
                  style={{
                    fontSize: 11.5,
                    color: 'var(--ink-40)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: 0,
                  }}
                >
                  {countFor(idx)} listings
                </button>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function QueueClear() {
  return (
    <div
      style={{
        padding: '44px 0',
        textAlign: 'center',
        fontSize: 12.5,
        color: 'var(--ink-40)',
        letterSpacing: '0.04em',
      }}
    >
      Queue clear.
    </div>
  );
}
