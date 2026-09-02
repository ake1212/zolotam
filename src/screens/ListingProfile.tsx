import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { PillarIcon } from '../components/PillarIcon';
import { BackLink, Button, SectionLabel } from '../components/primitives';
import { pillarName } from '../data/pillars';

/** Digits only — what tel: and wa.me both want. */
function dial(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function ListingProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getListing } = useApp();
  const listing = id ? getListing(id) : undefined;

  if (!listing) {
    return (
      <AppShell topSpacer showTabBar>
        <div style={{ padding: '0 24px 32px' }}>
          <BackLink onClick={() => navigate('/browse')} style={{ marginBottom: 40 }} />
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
            Listing not found.
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-50)', margin: '0 0 30px' }}>
            It may have been returned to its owner or removed from the directory.
          </p>
          <Button onClick={() => navigate('/browse')}>Back to the marketplace</Button>
        </div>
      </AppShell>
    );
  }

  const statusLabel = listing.verified
    ? 'Verified'
    : listing.status === 'pending'
      ? 'Pending review'
      : 'Unverified';
  const statusColor = listing.verified ? 'var(--gold)' : 'var(--ink-50)';

  const actions = [
    { label: 'Call', href: `tel:${dial(listing.phone)}`, primary: true, on: !!listing.phone },
    { label: 'Email', href: `mailto:${listing.email}`, primary: false, on: !!listing.email },
    {
      label: 'Message',
      href: `https://wa.me/${dial(listing.phone).replace(/^\+/, '')}`,
      primary: false,
      on: !!listing.phone,
    },
  ].filter((a) => a.on);

  return (
    <AppShell showTabBar>
      <div
        style={{
          position: 'relative',
          background: 'var(--panel)',
          height: 262,
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          borderBottomLeftRadius: 'var(--r-lg)',
          borderBottomRightRadius: 'var(--r-lg)',
        }}
      >
        {listing.cover ? (
          <img
            src={listing.cover}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '44%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.5,
            }}
          >
            <PillarIcon index={listing.pillarIdx} color="rgba(168,129,58,0.85)" size={42} />
          </div>
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--gold)' }} />

        <BackLink
          dark
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 'calc(var(--safe-top) + 64px)', left: 20 }}
        />

        <div style={{ padding: '20px 24px 22px', position: 'relative', width: '100%' }}>
          <div
            style={{
              fontSize: 8.5,
              fontWeight: 600,
              color: 'var(--gold)',
              letterSpacing: '0.18em',
              marginBottom: 9,
            }}
          >
            {pillarName(listing.pillarIdx).toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.03em',
                color: 'var(--paper)',
                margin: 0,
                lineHeight: 1.18,
              }}
            >
              {listing.name}
            </h1>
            {listing.verified ? (
              <span aria-label="Verified" style={{ fontSize: 11, color: 'var(--gold)', marginTop: 5 }}>
                ✦
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 24px 34px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              target={a.label === 'Message' ? '_blank' : undefined}
              rel={a.label === 'Message' ? 'noreferrer' : undefined}
              className="press"
              style={{
                flex: 1,
                padding: 13,
                textAlign: 'center',
                background: a.primary ? 'var(--ink)' : 'var(--surface)',
                border: a.primary ? '1px solid var(--ink)' : '1px solid var(--rule-strong)',
                borderRadius: 'var(--r-sm)',
                boxShadow: 'var(--shadow-sm)',
                color: a.primary ? 'var(--paper)' : 'var(--ink)',
                fontSize: 12.5,
                fontWeight: a.primary ? 600 : 500,
              }}
            >
              {a.label}
            </a>
          ))}
        </div>

        <SectionLabel>ABOUT</SectionLabel>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.7,
            color: 'rgba(20,18,15,0.75)',
            margin: '0 0 30px',
            textWrap: 'pretty',
          }}
        >
          {listing.description}
        </p>

        {listing.services.length > 0 ? (
          <>
            <SectionLabel mb={14}>SERVICES</SectionLabel>
            <div
              style={{
                marginBottom: 30,
                background: 'var(--surface)',
                border: '1px solid var(--surface-edge)',
                borderRadius: 'var(--r-md)',
                boxShadow: 'var(--shadow-sm)',
                padding: '2px 16px',
              }}
            >
              {listing.services.map((s, i) => (
                <div
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 0',
                    borderBottom:
                      i < listing.services.length - 1 ? '1px solid rgba(20,18,15,0.08)' : 'none',
                  }}
                >
                  <div style={{ width: 3, height: 3, background: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{s}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {listing.photos.length > 0 ? (
          <>
            <SectionLabel mb={14}>GALLERY</SectionLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                marginBottom: 30,
              }}
            >
              {listing.photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt=""
                  style={{
                    width: '100%',
                    height: 78,
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 'var(--r-sm)',
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        <SectionLabel mb={14}>DETAILS</SectionLabel>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-edge)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-sm)',
            padding: '2px 16px',
          }}
        >
          <DetailRow label="Location" value={`${listing.city}, ${listing.country}`} />
          <DetailRow label="Pillar" value={pillarName(listing.pillarIdx)} />
          {listing.website ? <DetailRow label="Website" value={listing.website} /> : null}
          <DetailRow label="Status" value={statusLabel} valueColor={statusColor} last />
        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
  valueColor = 'var(--ink)',
  last = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderBottom: last ? 'none' : '1px solid rgba(20,18,15,0.08)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--ink-50)', flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          color: valueColor,
          fontWeight: valueColor === 'var(--ink)' ? 500 : 600,
          textAlign: 'right',
          minWidth: 0,
          overflowWrap: 'anywhere',
        }}
      >
        {value}
      </span>
    </div>
  );
}
