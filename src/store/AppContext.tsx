import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Listing, Settings, User } from '../data/types';
import { BASE_MEMBER_COUNT, SEED_LISTINGS, SEED_USERS } from '../data/seed';
import { clearState, loadState, saveState } from './persist';

export interface NewListingDraft {
  pillarIdx: number;
  name: string;
  title: string;
  description: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  logo: string | null;
  cover: string | null;
  photos: string[];
}

export interface RegistrationDraft {
  name: string;
  email: string;
  phone: string;
  country: string;
  org: string;
  industry: string;
  password: string;
}

type LoginResult = { ok: true; user: User } | { ok: false; error: string };
type RegisterResult = { ok: true; user: User } | { ok: false; error: string };

interface AppValue {
  users: User[];
  listings: Listing[];
  memberCount: number;
  settings: Settings;
  currentUser: User | null;
  /** An approved member or an admin — anyone allowed past the member gate. */
  isMember: boolean;
  isAdmin: boolean;

  publishedListings: Listing[];
  featuredListings: Listing[];
  pendingListings: Listing[];
  pendingUsers: User[];
  listingsOwnedBy: (userId: string) => Listing[];
  getListing: (id: string) => Listing | undefined;

  login: (email: string, password: string) => LoginResult;
  loginAsAdmin: () => void;
  logout: () => void;
  register: (draft: RegistrationDraft) => RegisterResult;
  createListing: (draft: NewListingDraft) => Listing;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  publishListing: (id: string) => void;
  returnListing: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: true,
  language: 'English',
  publicProfile: true,
};

const AppContext = createContext<AppValue | null>(null);

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const restored = useRef(loadState()).current;

  const [users, setUsers] = useState<User[]>(restored?.users ?? SEED_USERS);
  const [listings, setListings] = useState<Listing[]>(restored?.listings ?? SEED_LISTINGS);
  const [memberCount, setMemberCount] = useState<number>(restored?.memberCount ?? BASE_MEMBER_COUNT);
  const [settings, setSettings] = useState<Settings>(restored?.settings ?? DEFAULT_SETTINGS);
  const [sessionUserId, setSessionUserId] = useState<string | null>(restored?.sessionUserId ?? null);

  useEffect(() => {
    saveState({ users, listings, memberCount, settings, sessionUserId });
  }, [users, listings, memberCount, settings, sessionUserId]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === sessionUserId) ?? null,
    [users, sessionUserId],
  );

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      const match = users.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (!match) return { ok: false, error: 'We have no account for that email address.' };
      if (match.password !== password) return { ok: false, error: 'That password is not correct.' };
      if (match.status === 'rejected') {
        return { ok: false, error: 'This application was declined. Contact the MPUGLOBAL team.' };
      }
      setSessionUserId(match.id);
      return { ok: true, user: match };
    },
    [users],
  );

  const loginAsAdmin = useCallback(() => {
    const admin = users.find((u) => u.role === 'admin');
    if (admin) setSessionUserId(admin.id);
  }, [users]);

  const logout = useCallback(() => setSessionUserId(null), []);

  const register = useCallback(
    (draft: RegistrationDraft): RegisterResult => {
      const taken = users.some(
        (u) => u.email.trim().toLowerCase() === draft.email.trim().toLowerCase(),
      );
      if (taken) return { ok: false, error: 'That email address is already registered.' };

      const user: User = {
        id: nextId('u'),
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        country: draft.country.trim() || 'Cameroon',
        org: draft.org.trim(),
        industry: draft.industry,
        password: draft.password,
        status: 'pending',
        role: 'member',
        memberSince: new Date().getFullYear(),
      };
      setUsers((prev) => [...prev, user]);
      setSessionUserId(user.id);
      return { ok: true, user };
    },
    [users],
  );

  const createListing = useCallback(
    (draft: NewListingDraft): Listing => {
      const listing: Listing = {
        id: nextId('l'),
        ownerId: sessionUserId,
        pillarIdx: draft.pillarIdx,
        name: draft.name.trim(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        services: draft.services,
        city: draft.city.trim(),
        country: draft.country.trim() || 'Cameroon',
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        website: draft.website.trim(),
        verified: false,
        status: 'pending',
        logo: draft.logo,
        cover: draft.cover,
        photos: draft.photos,
      };
      setListings((prev) => [listing, ...prev]);
      return listing;
    },
    [sessionUserId],
  );

  const approveUser = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'approved' } : u)));
    setMemberCount((c) => c + 1);
  }, []);

  const rejectUser = useCallback((id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'rejected' } : u)));
  }, []);

  const publishListing = useCallback((id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'published', verified: true } : l)),
    );
  }, []);

  const returnListing = useCallback((id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'returned' } : l)));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDemo = useCallback(() => {
    clearState();
    setUsers(SEED_USERS);
    setListings(SEED_LISTINGS);
    setMemberCount(BASE_MEMBER_COUNT);
    setSettings(DEFAULT_SETTINGS);
    setSessionUserId(null);
  }, []);

  const value = useMemo<AppValue>(() => {
    const publishedListings = listings.filter((l) => l.status === 'published');
    return {
      users,
      listings,
      memberCount,
      settings,
      currentUser,
      isMember:
        !!currentUser && (currentUser.status === 'approved' || currentUser.role === 'admin'),
      isAdmin: currentUser?.role === 'admin',

      publishedListings,
      featuredListings: publishedListings.filter((l) => l.verified).slice(0, 4),
      pendingListings: listings.filter((l) => l.status === 'pending'),
      pendingUsers: users.filter((u) => u.status === 'pending'),
      listingsOwnedBy: (userId: string) => listings.filter((l) => l.ownerId === userId),
      getListing: (id: string) => listings.find((l) => l.id === id),

      login,
      loginAsAdmin,
      logout,
      register,
      createListing,
      approveUser,
      rejectUser,
      publishListing,
      returnListing,
      updateSettings,
      resetDemo,
    };
  }, [
    users,
    listings,
    memberCount,
    settings,
    currentUser,
    login,
    loginAsAdmin,
    logout,
    register,
    createListing,
    approveUser,
    rejectUser,
    publishListing,
    returnListing,
    updateSettings,
    resetDemo,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
