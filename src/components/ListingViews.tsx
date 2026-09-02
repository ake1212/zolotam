import { useNavigate } from 'react-router-dom';
import type { Listing } from '../data/types';
import { pillarName } from '../data/pillars';
import { PillarIcon } from './PillarIcon';
import { ArtTile } from './primitives';

/** First clause of the description, used as the one-line tagline on a row. */
export function taglineOf(listing: Listing): string {
  return listing.title || listing.description.split(',')[0].slice(0, 34);
}

/** Horizontal card used on the "Verified this week" rail. */
export function FeaturedCard({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="press"
      style={{
        flex: '0 0 176px',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
        textAlign: 'left',
        font: 'inherit',
      }}
    >
      <ArtTile width={176} height={116} rule style={{ marginBottom: 11 }}>
        {listing.cover ? (
          <img
            src={listing.cover}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <PillarIcon index={listing.pillarIdx} color="rgba(168,129,58,0.9)" size={30} />
        )}
      </ArtTile>
      <div
        style={{
          fontSize: 8.5,
          fontWeight: 600,
          color: 'var(--gold)',
          letterSpacing: '0.16em',
          marginBottom: 5,
        }}
      >
        {pillarName(listing.pillarIdx).toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: 'var(--ink)',
          lineHeight: 1.3,
          letterSpacing: '-0.015em',
        }}
      >
        {listing.name}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-50)', marginTop: 3 }}>{listing.city}</div>
    </button>
  );
}

/** Full-width result row. */
export function ListingRow({ listing }: { listing: Listing }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="press"
      style={{
        display: 'flex',
        gap: 15,
        padding: '18px 0',
        cursor: 'pointer',
        alignItems: 'center',
        width: '100%',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--rule)',
        textAlign: 'left',
        font: 'inherit',
      }}
    >
      <ArtTile width={56} height={56}>
        {listing.logo ? (
          <img src={listing.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <PillarIcon index={listing.pillarIdx} color="rgba(168,129,58,0.9)" size={22} />
        )}
      </ArtTile>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 8.5,
            fontWeight: 600,
            color: 'var(--ink-40)',
            letterSpacing: '0.15em',
            marginBottom: 4,
          }}
        >
          {pillarName(listing.pillarIdx).toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.015em' }}>
            {listing.name}
          </div>
          {listing.verified ? (
            <span
              aria-label="Verified"
              style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em' }}
            >
              ✦
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-50)', marginTop: 3 }}>
          {listing.city} · {taglineOf(listing)}
        </div>
      </div>
    </button>
  );
}
