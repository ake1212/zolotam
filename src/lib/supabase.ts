import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Whether the app has a backend to talk to. Both values are baked in at build
 * time, so a missing one is a deployment mistake, not a runtime condition —
 * the app says so plainly rather than failing on the first query.
 */
export const isConfigured = Boolean(url && anonKey);

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    'Supabase is not configured. Copy .env.example to .env.local and fill in ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
  );
}

/**
 * The anon key is public by design — it identifies the project, it does not
 * grant access. Every row this client can reach is decided by RLS in
 * supabase/migrations/0001_init.sql. The service-role key must never appear
 * in this bundle.
 */
export const supabase = createClient<Database>(url ?? 'http://localhost', anonKey ?? 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // No email confirmation step at launch, so there is no callback URL to
    // parse on the way back into the app.
    detectSessionInUrl: false,
  },
});
