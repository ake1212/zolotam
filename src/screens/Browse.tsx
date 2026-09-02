import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { PillarGrid } from '../components/PillarGrid';
import { FeaturedCard } from '../components/ListingViews';
import { SectionRule } from '../components/primitives';
import { SearchField } from '../components/SearchField';

export function Browse() {
  const navigate = useNavigate();
  const { currentUser, isMember, isAdmin, featuredListings, memberCount } = useApp();
  const [query, setQuery] = useState('');

  function runSearch() {
    const q = query.trim();
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <AppShell topSpacer showTabBar>
      <div style={{ padding: '0 24px 32px' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--r-xs)',
                background: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--paper)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              M
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--ink-50)',
                letterSpacing: '0.2em',
              }}
            >
              MPUGLOBAL
            </div>
          </div>

          {isMember && currentUser ? (
            <button
              type="button"
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              aria-label={isAdmin ? 'Open the control room' : 'Open your dashboard'}
              className="press"
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--ink)',
                color: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--ink)',
                letterSpacing: '0.1em',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              LOG IN
            </button>
          )}
        </header>

        <h1
          style={{
            fontSize: 29,
            lineHeight: 1.12,
            fontWeight: 600,
            letterSpacing: '-0.032em',
            color: 'var(--ink)',
            margin: '0 0 20px',
          }}
        >
          Find who you
          <br />
          need to know.
        </h1>

        <div style={{ marginBottom: 34 }}>
          <SearchField
            value={query}
            onChange={setQuery}
            onSubmit={runSearch}
            placeholder="Search businesses, services, cities"
          />
        </div>

        <SectionRule label="THE SIXTEEN PILLARS" mb={18} />
        <PillarGrid onSelect={(idx) => navigate(`/search?pillar=${idx}`)} style={{ marginBottom: 38 }} />

        <SectionRule label="VERIFIED THIS WEEK" />
        {featuredListings.length > 0 ? (
          <div className="rail" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
            {featuredListings.map((l) => (
              <FeaturedCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '30px 0', fontSize: 13, color: 'var(--ink-40)' }}>
            No verified listings yet.
          </div>
        )}

        <div
          style={{
            marginTop: 34,
            paddingTop: 18,
            borderTop: '1px solid var(--rule)',
            fontSize: 11.5,
            color: 'var(--ink-40)',
          }}
        >
          {memberCount.toLocaleString('en-US')} members across sixteen pillars.
        </div>
      </div>
    </AppShell>
  );
}
