import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Listing, Settings, User } from '../data/types';
import { supabase, isConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import type { NewListingDraft, RegistrationDraft } from '../lib/api';

export type { NewListingDraft, RegistrationDraft };

type ActionResult = { ok: true } | { ok: false; error: string };
type LoginResult = { ok: true; user: User } | { ok: false; error: string };

interface AppValue {
  users: User[];
  listings: Listing[];
  memberCount: number;
  pillarCounts: Record<number, number>;
  settings: Settings;
  currentUser: User | null;
  /** An approved member or an admin — anyone allowed past the member gate. */
  isMember: boolean;
  isAdmin: boolean;

  /** False once the first load settles, so routes do not redirect too early. */
  loading: boolean;
  /** Set when the backend is unreachable or misconfigured. */
  error: string | null;

  publishedListings: Listing[];
  featuredListings: Listing[];
  pendingListings: Listing[];
  pendingUsers: User[];
  listingsOwnedBy: (userId: string) => Listing[];
  getListing: (id: string) => Listing | undefined;

  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (draft: RegistrationDraft) => Promise<ActionResult>;
  createListing: (draft: NewListingDraft) => Promise<ActionResult>;
  approveUser: (id: string) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
  publishListing: (id: string) => Promise<void>;
  returnListing: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  language: 'English',
  publicProfile: true,
};

const NOT_CONFIGURED =
  'This build has no backend configured. Set VITE_SUPABASE_URL and ' +
  'VITE_SUPABASE_ANON_KEY, then rebuild.';

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [pillarCounts, setPillarCounts] = useState<Record<number, number>>({});
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pulls everything the current viewer is entitled to. Called on mount, on
   * every auth change, and after any write — the server decides what comes
   * back, so a member and an admin run the identical code path.
   */
  const load = useCallback(async (userId: string | null) => {
    try {
      const [listingRows, count, counts] = await Promise.all([
        api.fetchListings(),
        api.fetchMemberCount(),
        api.fetchPillarCounts(),
      ]);
      setListings(listingRows);
      setMemberCount(count);
      setPillarCounts(counts);

      if (userId) {
        // fetchProfiles returns the whole table for an admin and a single row
        // for everyone else, which is exactly what each needs.
        const [profile, all] = await Promise.all([
          api.fetchProfile(userId),
          api.fetchProfiles(),
        ]);
        setUsers(all);
        setCurrentUser(profile ? api.toUser(profile) : null);
        setSettings(profile ? api.toSettings(profile) : DEFAULT_SETTINGS);
      } else {
        setUsers([]);
        setCurrentUser(null);
        setSettings(DEFAULT_SETTINGS);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the MPUGLOBAL service.');
    }
  }, []);

  // One subscription drives the whole session: the initial INITIAL_SESSION
  // event covers the first load, so there is no separate bootstrap fetch to
  // race against a sign-in that happens while it is still in flight.
  useEffect(() => {
    if (!isConfigured) {
      setError(NOT_CONFIGURED);
      setLoading(false);
      return;
    }

    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setLoading(true);
      void load(session?.user.id ?? null).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await load(data.session?.user.id ?? null);
  }, [load]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      if (!isConfigured) return { ok: false, error: NOT_CONFIGURED };

      const { error: signInError } = await api.signIn(email, password);
      if (signInError) return { ok: false, error: signInError };

      const { data } = await supabase.auth.getSession();
      const id = data.session?.user.id;
      if (!id) return { ok: false, error: 'Sign-in did not return a session.' };

      const profile = await api.fetchProfile(id);
      if (!profile) return { ok: false, error: 'This account has no MPUGLOBAL profile.' };

      // A declined application keeps its credentials but not its access, so
      // the door closes here rather than on a later query coming back empty.
      if (profile.status === 'rejected') {
        await api.signOut();
        return { ok: false, error: 'This application was declined. Contact the MPUGLOBAL team.' };
      }

      const user = api.toUser(profile);
      await load(id);
      return { ok: true, user };
    },
    [load],
  );

  const logout = useCallback(async () => {
    await api.signOut();
  }, []);

  const register = useCallback(
    async (draft: RegistrationDraft): Promise<ActionResult> => {
      if (!isConfigured) return { ok: false, error: NOT_CONFIGURED };
      const { error: signUpError } = await api.signUp(draft);
      if (signUpError) return { ok: false, error: signUpError };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const createListing = useCallback(
    async (draft: NewListingDraft): Promise<ActionResult> => {
      if (!currentUser) return { ok: false, error: 'You need to be signed in to add a listing.' };
      try {
        await api.createListing(currentUser.id, draft);
        await refresh();
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : 'The listing could not be submitted.',
        };
      }
    },
    [currentUser, refresh],
  );

  const approveUser = useCallback(
    async (id: string) => {
      await api.setUserStatus(id, 'approved');
      await refresh();
    },
    [refresh],
  );

  const rejectUser = useCallback(
    async (id: string) => {
      await api.setUserStatus(id, 'rejected');
      await refresh();
    },
    [refresh],
  );

  const publishListing = useCallback(
    async (id: string) => {
      await api.publishListing(id);
      await refresh();
    },
    [refresh],
  );

  const returnListing = useCallback(
    async (id: string) => {
      await api.returnListing(id);
      await refresh();
    },
    [refresh],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!currentUser) return;
      // Applied locally first: a preference toggle should not wait on a
      // round trip to look like it worked.
      setSettings((prev) => ({ ...prev, ...patch }));
      await api.updateSettings(currentUser.id, patch);
    },
    [currentUser],
  );

  const value = useMemo<AppValue>(() => {
    const publishedListings = listings.filter((l) => l.status === 'published');
    return {
      users,
      listings,
      memberCount,
      pillarCounts,
      settings,
      currentUser,
      isMember:
        !!currentUser && (currentUser.status === 'approved' || currentUser.role === 'admin'),
      isAdmin: currentUser?.role === 'admin',
      loading,
      error,

      publishedListings,
      featuredListings: publishedListings.filter((l) => l.verified).slice(0, 4),
      pendingListings: listings.filter((l) => l.status === 'pending'),
      pendingUsers: users.filter((u) => u.status === 'pending'),
      listingsOwnedBy: (userId: string) => listings.filter((l) => l.ownerId === userId),
      getListing: (id: string) => listings.find((l) => l.id === id),

      login,
      logout,
      register,
      createListing,
      approveUser,
      rejectUser,
      publishListing,
      returnListing,
      updateSettings,
      refresh,
    };
  }, [
    users,
    listings,
    memberCount,
    pillarCounts,
    settings,
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    createListing,
    approveUser,
    rejectUser,
    publishListing,
    returnListing,
    updateSettings,
    refresh,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
