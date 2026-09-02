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
 * Guarded routes send anyone without a session to the landing page — the front
 * door, which offers both log in and apply. Redirecting to /login instead would
 * also fire on sign-out (the route is still matched when the session clears)
 * and strand the member on a login form they just left.
 */
function MemberRoute({ children }: { children: ReactElement }) {
  const { currentUser, isMember } = useApp();
  if (!currentUser) return <Navigate to="/" replace />;
  if (!isMember) return <Navigate to="/pending" replace />;
  return children;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { isAdmin } = useApp();
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

export function App() {
  return (
    <>
      <ScrollReset />
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
