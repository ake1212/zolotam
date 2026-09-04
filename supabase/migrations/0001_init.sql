-- MPUGLOBAL — initial schema.
--
-- Two tables carry the whole product: profiles (a member application and the
-- account it becomes) and listings (what a member publishes to the directory).
-- Passwords are NOT here — Supabase Auth owns auth.users and the credentials
-- in it. A profile is the public half of an account, keyed by the same id.
--
-- The access matrix from the product blueprint is enforced by RLS below, not
-- by the client: a visitor sees published listings, a pending member sees the
-- same plus their own application, an approved member can list, and an admin
-- can vet. Anything the client asks for outside that comes back empty.

-- ── types ────────────────────────────────────────────────────────────────

create type public.user_status as enum ('pending', 'approved', 'rejected');
create type public.user_role as enum ('member', 'admin');
create type public.listing_status as enum ('published', 'pending', 'returned');

-- ── profiles ─────────────────────────────────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text not null default '',
  email        text not null default '',
  phone        text not null default '',
  country      text not null default 'Cameroon',
  org          text not null default '',
  -- Pillar name as picked on the application form, kept as free text: the
  -- pillar list is client-side reference data and may be re-ordered.
  industry     text not null default '',

  status       public.user_status not null default 'pending',
  role         public.user_role not null default 'member',
  member_since int not null default extract(year from now()),

  -- Admin-set cap on how many of this member's listings may be published at
  -- once (blueprint §13). Stored and adjustable now; not yet enforced, because
  -- the UI has no "queued" state to show a listing that clears review but has
  -- no room. Enforcement belongs with that screen, not ahead of it.
  listing_cap  int not null default 3 check (listing_cap >= 0),

  -- Per-member preferences. On the profile rather than in their own table:
  -- one row per person either way, and it saves a join on every dashboard.
  notifications  boolean not null default true,
  language       text not null default 'English' check (language in ('English', 'Français')),
  public_profile boolean not null default true,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.profiles.listing_cap is
  'Max simultaneously published listings. Not yet enforced — see 0001_init.sql.';

-- ── listings ─────────────────────────────────────────────────────────────

create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  -- Nulled rather than deleted when an owner is removed, so the directory
  -- does not lose entries an admin may still want to reassign or take down.
  owner_id    uuid references public.profiles (id) on delete set null,
  pillar_idx  int not null check (pillar_idx >= 0),

  name        text not null check (length(trim(name)) > 0),
  title       text not null default '',
  description text not null default '',
  services    text[] not null default '{}',

  city        text not null default '',
  country     text not null default 'Cameroon',
  phone       text not null default '',
  email       text not null default '',
  website     text not null default '',

  verified    boolean not null default false,
  status      public.listing_status not null default 'pending',

  -- Public URLs into the listing-media storage bucket.
  logo_url    text,
  cover_url   text,
  photos      text[] not null default '{}',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index listings_status_idx on public.listings (status);
create index listings_pillar_idx on public.listings (pillar_idx);
create index listings_owner_idx on public.listings (owner_id);

-- Directory search runs over the fields a person actually types into the
-- search box: business name, listing title, and city.
create index listings_search_idx on public.listings
  using gin (to_tsvector('simple', name || ' ' || title || ' ' || city));

-- ── updated_at ───────────────────────────────────────────────────────────

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger listings_touch_updated_at
  before update on public.listings
  for each row execute function public.touch_updated_at();

-- ── role helpers ─────────────────────────────────────────────────────────
--
-- SECURITY DEFINER on purpose: these read profiles from inside the very
-- policies that guard profiles, and a plain query there would recurse.

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.is_approved()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and (status = 'approved' or role = 'admin')
  );
$$;

-- ── a new sign-up becomes a pending profile ──────────────────────────────
--
-- The application form's fields ride along in auth metadata at sign-up and
-- are unpacked here, so registering is a single call from the client and the
-- profile can never be missing for an account that exists.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, country, org, industry)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'Cameroon'),
    coalesce(new.raw_user_meta_data ->> 'org', ''),
    coalesce(new.raw_user_meta_data ->> 'industry', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── privilege guards ─────────────────────────────────────────────────────
--
-- RLS decides which ROWS you may touch; it cannot stop you rewriting a
-- privileged COLUMN in a row you legitimately own. Without these, a member
-- could PATCH their own profile to role='admin', or flip their own listing
-- to published, straight from the browser.

create function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A null uid means the caller carries no user JWT: the SQL editor, a
  -- migration, or the service-role key. Those already bypass RLS, and one of
  -- them has to create the first admin — at which point is_admin() is false
  -- for everyone and this guard would otherwise make that impossible.
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.listing_cap is distinct from old.listing_cap then
    raise exception 'Only an administrator can change role, status or listing cap';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

create function public.guard_listing_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if new.verified is distinct from old.verified then
    raise exception 'Only an administrator can verify a listing';
  end if;

  -- A member may resubmit a returned listing, and nothing else: publishing is
  -- an admin decision.
  if new.status is distinct from old.status and new.status <> 'pending' then
    raise exception 'Only an administrator can publish or return a listing';
  end if;

  if new.owner_id is distinct from old.owner_id then
    raise exception 'A listing cannot change owner';
  end if;

  return new;
end;
$$;

create trigger listings_guard_privileges
  before update on public.listings
  for each row execute function public.guard_listing_privileges();

-- ── row level security ───────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

-- Profiles are private. You see yourself; an admin sees the queue.
create policy profiles_select on public.profiles
  for select using (id = (select auth.uid()) or public.is_admin());

-- The sign-up trigger inserts as definer, so this only covers a client
-- backfilling its own missing row.
create policy profiles_insert on public.profiles
  for insert with check (id = (select auth.uid()));

-- Column-level limits come from guard_profile_privileges above.
create policy profiles_update on public.profiles
  for update using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

create policy profiles_delete on public.profiles
  for delete using (public.is_admin());

-- The directory itself: published listings are the public face of the
-- platform and readable by anyone, signed in or not.
create policy listings_select on public.listings
  for select using (
    status = 'published'
    or owner_id = (select auth.uid())
    or public.is_admin()
  );

-- Only an approved member may list. A pending applicant cannot.
create policy listings_insert on public.listings
  for insert with check (owner_id = (select auth.uid()) and public.is_approved());

create policy listings_update on public.listings
  for update using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());

create policy listings_delete on public.listings
  for delete using (owner_id = (select auth.uid()) or public.is_admin());

-- ── public counters ──────────────────────────────────────────────────────
--
-- The landing page shows a member count, but profiles are not publicly
-- readable — so the number comes from a definer function that exposes the
-- count and nothing else.

create function public.member_count()
returns int
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::int from public.profiles where status = 'approved';
$$;

-- Published listings per pillar, for the admin pillar table and browse
-- counts. Plain (not definer): published rows are readable anyway.
create function public.pillar_counts()
returns table (pillar_idx int, total int)
language sql
stable
set search_path = public
as $$
  select pillar_idx, count(*)::int
  from public.listings
  where status = 'published'
  group by pillar_idx;
$$;

-- ── grants ───────────────────────────────────────────────────────────────

grant usage on schema public to anon, authenticated;

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant delete on public.profiles to authenticated; -- narrowed to admins by RLS

grant execute on function public.member_count() to anon, authenticated;
grant execute on function public.pillar_counts() to anon, authenticated;

-- ── storage ──────────────────────────────────────────────────────────────
--
-- One public bucket for listing media. Reads are open because a listing's
-- logo and photos appear on a public page; writes are confined to a folder
-- named for the uploader's own id.

insert into storage.buckets (id, name, public)
values ('listing-media', 'listing-media', true)
on conflict (id) do nothing;

create policy listing_media_read on storage.objects
  for select using (bucket_id = 'listing-media');

create policy listing_media_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy listing_media_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'listing-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy listing_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-media'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
  );
