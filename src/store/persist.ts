import type { Listing, Settings, User } from '../data/types';

export const STORAGE_KEY = 'mpuglobal.state.v1';

export interface PersistedState {
  users: User[];
  listings: Listing[];
  memberCount: number;
  settings: Settings;
  sessionUserId: string | null;
}

/**
 * Uploaded images live as data URLs, which would blow the localStorage quota
 * in a handful of listings. They are dropped on write and come back empty —
 * the real upload pipeline lands with the backend.
 */
function stripImages(listings: Listing[]): Listing[] {
  return listings.map((l) => ({ ...l, logo: null, cover: null, photos: [] }));
}

export function loadState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.listings)) return null;
    return parsed;
  } catch {
    // Private mode, blocked site data, or a corrupt entry — fall back to seed.
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, listings: stripImages(state.listings) }),
    );
  } catch {
    // Quota or blocked storage: the session still works, it just won't survive a reload.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}
