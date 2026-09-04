/**
 * Every call the app makes to the backend lives here, so the screens stay
 * unaware of PostgREST and the store stays unaware of table names.
 *
 * Nothing in this file enforces permissions. Authorisation is RLS's job (see
 * supabase/migrations/0001_init.sql); a query that asks for more than the
 * caller may see comes back short rather than erroring, and a write that
 * oversteps is rejected by the database.
 */

import { supabase } from './supabase';
import type { ListingRow, ProfileRow } from './database.types';
import type { Listing, Settings, User } from '../data/types';

const BUCKET = 'listing-media';

/* ── row ⇄ app type ──────────────────────────────────────────────────── */

export function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    org: row.org,
    industry: row.industry,
    status: row.status,
    role: row.role,
    memberSince: row.member_since,
    listingCap: row.listing_cap,
  };
}

export function toSettings(row: ProfileRow): Settings {
  return {
    notifications: row.notifications,
    language: row.language,
    publicProfile: row.public_profile,
  };
}

export function toListing(row: ListingRow): Listing {
  return {
    id: row.id,
    ownerId: row.owner_id,
    pillarIdx: row.pillar_idx,
    name: row.name,
    title: row.title,
    description: row.description,
    services: row.services,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    website: row.website,
    verified: row.verified,
    status: row.status,
    logo: row.logo_url,
    cover: row.cover_url,
    photos: row.photos,
  };
}

/* ── reads ───────────────────────────────────────────────────────────── */

/**
 * Everything the signed-in caller is allowed to see: published listings for
 * anyone, plus their own drafts, plus the whole queue for an admin. One query
 * covers all three because the policy does the filtering.
 */
export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toListing);
}

/** Returns every profile for an admin, and just your own otherwise. */
export async function fetchProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toUser);
}

export async function fetchProfile(id: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMemberCount(): Promise<number> {
  const { data, error } = await supabase.rpc('member_count');
  if (error) throw error;
  return data ?? 0;
}

/** Published listings per pillar, as a lookup keyed by pillar index. */
export async function fetchPillarCounts(): Promise<Record<number, number>> {
  const { data, error } = await supabase.rpc('pillar_counts');
  if (error) throw error;
  const counts: Record<number, number> = {};
  for (const row of data ?? []) counts[row.pillar_idx] = row.total;
  return counts;
}

/* ── auth ────────────────────────────────────────────────────────────── */

export interface RegistrationDraft {
  name: string;
  email: string;
  phone: string;
  country: string;
  org: string;
  industry: string;
  password: string;
}

/**
 * The application form's answers travel as auth metadata and are unpacked
 * into a pending profile by the on_auth_user_created trigger, so an account
 * can never exist without its application.
 */
export async function signUp(draft: RegistrationDraft): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({
    email: draft.email.trim(),
    password: draft.password,
    options: {
      data: {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        country: draft.country.trim() || 'Cameroon',
        org: draft.org.trim(),
        industry: draft.industry,
      },
    },
  });
  if (!error) return { error: null };

  // Supabase reports a duplicate address differently depending on whether
  // email confirmation is on; both mean the same thing to an applicant.
  if (/already registered|already exists|duplicate/i.test(error.message)) {
    return { error: 'That email address is already registered.' };
  }
  return { error: error.message };
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (!error) return { error: null };

  if (/invalid login credentials/i.test(error.message)) {
    return { error: 'That email address and password do not match an account.' };
  }
  return { error: error.message };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/* ── media ───────────────────────────────────────────────────────────── */

/**
 * Uploads one image picked in the browser and returns its public URL.
 *
 * The picker hands over a data URL; storage wants bytes. Files land under a
 * folder named for the uploader, which is exactly what the bucket policy
 * checks, so one member cannot write into another's folder.
 */
async function uploadImage(userId: string, kind: string, dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = (blob.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Passes through anything that is already a URL, uploads anything that isn't. */
async function resolveImage(
  userId: string,
  kind: string,
  value: string | null,
): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith('data:')) return value;
  return uploadImage(userId, kind, value);
}

/* ── writes ──────────────────────────────────────────────────────────── */

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

export async function createListing(ownerId: string, draft: NewListingDraft): Promise<Listing> {
  const [logo, cover, photos] = await Promise.all([
    resolveImage(ownerId, 'logo', draft.logo),
    resolveImage(ownerId, 'cover', draft.cover),
    Promise.all(draft.photos.map((p) => resolveImage(ownerId, 'photo', p))),
  ]);

  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: ownerId,
      pillar_idx: draft.pillarIdx,
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
      logo_url: logo,
      cover_url: cover,
      photos: photos.filter((p): p is string => p !== null),
    })
    .select()
    .single();

  if (error) throw error;
  return toListing(data);
}

/* Admin actions. RLS rejects these for anyone who is not an admin. */

export async function setUserStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function publishListing(id: string): Promise<void> {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'published', verified: true })
    .eq('id', id);
  if (error) throw error;
}

export async function returnListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').update({ status: 'returned' }).eq('id', id);
  if (error) throw error;
}

export async function updateSettings(id: string, patch: Partial<Settings>): Promise<void> {
  const row: Partial<ProfileRow> = {};
  if (patch.notifications !== undefined) row.notifications = patch.notifications;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.publicProfile !== undefined) row.public_profile = patch.publicProfile;

  const { error } = await supabase.from('profiles').update(row).eq('id', id);
  if (error) throw error;
}
