export type ListingStatus = 'published' | 'pending' | 'returned';

export interface Listing {
  id: string;
  ownerId: string | null;
  pillarIdx: number;
  /** Business / organisation name — the headline on every card. */
  name: string;
  /** Short listing title shown under the name on the preview card. */
  title: string;
  description: string;
  services: string[];
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  verified: boolean;
  status: ListingStatus;
  /** Public URLs into the listing-media storage bucket. */
  logo: string | null;
  cover: string | null;
  photos: string[];
}

export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'member' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  org: string;
  /** Pillar name, as picked on the application form. */
  industry: string;
  status: UserStatus;
  role: UserRole;
  memberSince: number;
  /** Admin-set cap on simultaneously published listings. Not yet enforced. */
  listingCap: number;
}

export interface Settings {
  notifications: boolean;
  language: 'English' | 'Français';
  publicProfile: boolean;
}
