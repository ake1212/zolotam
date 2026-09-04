-- MPUGLOBAL — function privilege hardening.
--
-- Follow-up to 0001_init.sql, from the Supabase database linter's security
-- advisories on the live project. Two distinct findings, one real gap and one
-- dangling capability.

-- 1. touch_updated_at was the only function in 0001_init.sql without a pinned
--    search_path. It calls nothing unqualified today, so nothing was
--    exploitable, but every other function pins one and this closes the gap
--    for whatever it grows to call later.
alter function public.touch_updated_at() set search_path = public;

-- 2. Postgres grants EXECUTE to PUBLIC on every new function, which puts these
--    three on the REST surface as /rest/v1/rpc/<name>. They are trigger
--    functions (return type "trigger"), so Postgres refuses to invoke them
--    outside a trigger and the grant can never actually be exercised —
--    revoking it removes the advisory and the dangling capability without
--    changing how the triggers themselves fire.
revoke execute on function public.guard_profile_privileges() from public, anon, authenticated;
revoke execute on function public.guard_listing_privileges() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Deliberately NOT revoked: is_admin(), is_approved() and member_count().
-- The linter flags these too, but they are meant to be callable —
-- is_admin/is_approved are invoked by the RLS policies in 0001_init.sql, which
-- run as the querying role, and member_count() backs the landing page's member
-- stat for signed-out visitors. Each checks auth.uid() internally or returns
-- only an aggregate, so none of them exposes a row a caller could not already
-- read. 0001_init.sql grants EXECUTE on them explicitly.
