import { useEffect, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './store/AppContext';
import { Landing } from './screens/Landing';
import { Browse } from './screens/Browse';
import { SearchResults } from './screens/SearchResults';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { Pending } from './screens/Pending';
import { Dashboard } from './screens/Dashboard';
import { AddListing } from './screens/AddListing';
import { ListingProfile } from './screens/ListingProfile';
import { Admin } from './screens/Admin';

/**
 * Held while the stored session is being restored. Without it a refresh on a
 * guarded route redirects on the first render — before the session is known —
 * and signs the member out of a page they were entitled to.
 */
function Restoring() {
  return (
    <div className="backdrop">
      <div className="device" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 12.5, letterSpacing: '0.08em', color: 'var(--ink-40)' }}>
          MPUGLOBAL
        </div>
      </div>
    </div>
  );
}

/**
 * Guarded routes send anyone without a session to the landing page — the front
 * door, which offers both log in and apply. Redirecting to /login instead would
 * also fire on sign-out (the route is still matched when the session clears)
 * and strand the member on a login form they just left.
 */
function MemberRoute({ children }: { children: ReactElement }) {
  const { currentUser, isMember, loading } = useApp();
  if (loading) return <Restoring />;
  if (!currentUser) return <Navigate to="/" replace />;
  if (!isMember) return <Navigate to="/pending" replace />;
  return children;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { isAdmin, loading } = useApp();
  if (loading) return <Restoring />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

/** New route, new scroll position — the shell scroller is reused across screens. */
function ScrollReset() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.querySelector('.deviceScroll')?.scrollTo({ top: 0 });
  }, [pathname, search]);
  return null;
}

/**
 * A backend that cannot be reached is otherwise indistinguishable from an
 * empty directory — the listings simply do not arrive. This says which it is,
 * which is the difference between "no one has listed yet" and "the deploy is
 * missing its environment variables".
 */
function ServiceNotice() {
  const { error } = useApp();
  if (!error) return null;
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 50,
        margin: '0 auto',
        maxWidth: 390,
        padding: '11px 14px',
        borderRadius: 'var(--r-sm)',
        background: 'var(--ground)',
        color: 'var(--paper)',
        fontSize: 12.5,
        lineHeight: 1.5,
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {error}
    </div>
  );
}

export function App() {
  return (
    <>
      <ScrollReset />
      <ServiceNotice />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/listing/:id" element={<ListingProfile />} />
        <Route
          path="/dashboard"
          element={
            <MemberRoute>
              <Dashboard />
            </MemberRoute>
          }
        />
        <Route
          path="/dashboard/new"
          element={
            <MemberRoute>
              <AddListing />
            </MemberRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
