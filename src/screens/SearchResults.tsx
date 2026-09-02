import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { AppShell } from '../components/AppShell';
import { ListingRow } from '../components/ListingViews';
import { BackLink } from '../components/primitives';
import { SearchGlass } from '../components/SearchGlass';
import { PILLARS, pillarName } from '../data/pillars';

export function SearchResults() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { publishedListings } = useApp();

  const query = params.get('q') ?? '';
  const pillarParam = params.get('pillar');
  const pillarIdx =
    pillarParam !== null && /^\d+$/.test(pillarParam) && Number(pillarParam) < PILLARS.length
      ? Number(pillarParam)
      : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return publishedListings.filter((l) => {
      if (pillarIdx !== null && l.pillarIdx !== pillarIdx) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        pillarName(l.pillarIdx).toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.services.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [publishedListings, query, pillarIdx]);

  const title = pillarIdx !== null ? pillarName(pillarIdx) : query.trim() || 'All pillars';

  function setQuery(next: string) {
    const nextParams = new URLSearchParams(params);
    if (next) nextParams.set('q', next);
    else nextParams.delete('q');
    setParams(nextParams, { replace: true });
  }

  return (
    <AppShell topSpacer showTabBar>
      <div style={{ padding: '0 24px 32px' }}>
        <BackLink onClick={() => navigate('/browse')} style={{ marginBottom: 22 }} />

        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
            margin: '0 0 6px',
          }}
        >
          {title}
        </h1>
        <div style={{ fontSize: 11.5, color: 'var(--ink-45)', marginBottom: 22 }}>
          {results.length} {results.length === 1 ? 'listing' : 'listings'}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid var(--rule-strong)',
            paddingBottom: 10,
            marginBottom: 8,
          }}
        >
          <SearchGlass size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pillarIdx !== null ? 'Refine this pillar' : 'Search businesses, services, cities'}
            aria-label="Refine results"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 13.5,
              color: 'var(--ink)',
              outline: 'none',
              padding: 0,
            }}
          />
          {pillarIdx !== null ? (
            <button
              type="button"
              onClick={() => navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')}
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: 'var(--ink-40)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}
            >
              ALL
            </button>
          ) : null}
        </div>

        {results.map((l) => (
          <ListingRow key={l.id} listing={l} />
        ))}

        {results.length === 0 ? (
          <div style={{ padding: '50px 0', textAlign: 'center', fontSize: 13, color: 'var(--ink-40)' }}>
            {pillarIdx !== null && !query.trim()
              ? 'No listings in this pillar yet.'
              : 'Nothing matches that search yet.'}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
