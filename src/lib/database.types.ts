/**
 * Row shapes for the tables in supabase/migrations/0001_init.sql.
 *
 * Hand-written rather than generated so the repo does not need the Supabase
 * CLI wired up to typecheck. If you later run
 *   supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 * it will produce the same shape with more of PostgREST's generics attached.
 */

export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'member' | 'admin';
export type ListingStatus = 'published' | 'pending' | 'returned';

export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  org: string;
  industry: string;
  status: UserStatus;
  role: UserRole;
  member_since: number;
  listing_cap: number;
  notifications: boolean;
  language: 'English' | 'Français';
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

export type ListingRow = {
  id: string;
  owner_id: string | null;
  pillar_idx: number;
  name: string;
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
  logo_url: string | null;
  cover_url: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      listings: {
        Row: ListingRow;
        Insert: Omit<ListingRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<ListingRow>;
        Relationships: [
          {
            foreignKeyName: 'listings_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      member_count: { Args: Record<string, never>; Returns: number };
      pillar_counts: {
        Args: Record<string, never>;
        Returns: { pillar_idx: number; total: number }[];
      };
    };
    Enums: {
      user_status: UserStatus;
      user_role: UserRole;
      listing_status: ListingStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
