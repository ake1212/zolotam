import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

interface Tab {
  key: string;
  label: string;
  /** Route the tab lights up on. */
  match: string;
}

const TABS: Tab[] = [
  { key: 'home', label: 'HOME', match: '/browse' },
  { key: 'search', label: 'SEARCH', match: '/search' },
  { key: 'list', label: 'LIST', match: '/dashboard/new' },
  { key: 'account', label: 'ACCOUNT', match: '/dashboard' },
];

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isMember, isAdmin } = useApp();

  function targetFor(tab: Tab): string {
    if (tab.key === 'list') return isMember ? '/dashboard/new' : '/login';
    if (tab.key === 'account') {
      if (!isMember) return '/login';
      return isAdmin ? '/admin' : '/dashboard';
    }
    return tab.match;
  }

  return (
    <nav
      style={{
        flexShrink: 0,
        display: 'flex',
        borderTop: '1px solid rgba(20,18,15,0.1)',
        background: 'var(--paper)',
        padding: '0 12px calc(var(--safe-bottom) + 24px)',
      }}
    >
      {TABS.map((tab) => {
        // /dashboard/new must not also light up ACCOUNT.
        const active = tab.key === 'account' ? pathname === '/dashboard' : pathname === tab.match;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(targetFor(tab))}
            className="press"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              paddingTop: 12,
              background: 'none',
              border: 'none',
            }}
          >
            <div
              style={{
                width: 18,
                height: 3,
                borderRadius: 'var(--r-pill)',
                background: active ? 'var(--gold)' : 'transparent',
                marginBottom: 9,
              }}
            />
            <div
              style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: active ? 'var(--ink)' : 'rgba(20,18,15,0.42)',
              }}
            >
              {tab.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
}
