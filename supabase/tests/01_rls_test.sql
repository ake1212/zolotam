\set ON_ERROR_STOP on
\pset format unaligned
\pset tuples_only on

-- Three accounts, created the way a sign-up does: insert into auth.users and
-- let the trigger build the profile.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-00000000000a', 'admin@mpuglobal.com', '{"name":"Admin"}'),
  ('00000000-0000-4000-8000-00000000000b', 'member@example.com',  '{"name":"Member"}'),
  ('00000000-0000-4000-8000-00000000000c', 'pending@example.com', '{"name":"Applicant"}');

select 'trigger created ' || count(*) || ' profiles (expect 3)' from public.profiles;

-- Promote one to admin and approve one member (as the table owner, standing in
-- for the one-off bootstrap an operator does by hand).
update public.profiles set role='admin', status='approved' where id='00000000-0000-4000-8000-00000000000a';
update public.profiles set status='approved' where id='00000000-0000-4000-8000-00000000000b';

-- A published listing and a pending one belonging to the member.
insert into public.listings (id, owner_id, pillar_idx, name, status, verified) values
  ('22222222-0000-4000-8000-000000000001','00000000-0000-4000-8000-00000000000b',0,'Member Published','published',true),
  ('22222222-0000-4000-8000-000000000002','00000000-0000-4000-8000-00000000000b',0,'Member Pending','pending',false),
  ('22222222-0000-4000-8000-000000000003',null,1,'Someone Else Pending','pending',false);

\echo '--- 1. anon sees only published ---'
set role anon;
select 'anon listings: ' || count(*) || ' (expect 1 published)' from public.listings;
do $$ begin
  perform count(*) from public.profiles;
  raise notice 'FAIL: anon could read profiles';
exception when others then raise notice 'PASS: anon cannot read profiles (%)', SQLERRM;
end $$;
select 'anon member_count(): ' || public.member_count() || ' (expect 2)';
reset role;

\echo '--- 2. approved member: sees published + own pending, not others pending ---'
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-00000000000b';
select 'member listings: ' || count(*) || ' (expect 2)' from public.listings;
select 'member profiles: ' || count(*) || ' (expect 1 - self only)' from public.profiles;

\echo '--- 3. member CANNOT self-promote to admin ---'
do $$ begin
  update public.profiles set role='admin' where id='00000000-0000-4000-8000-00000000000b';
  raise notice 'FAIL: self-promotion succeeded';
exception when others then raise notice 'PASS: blocked (%)', SQLERRM;
end $$;

\echo '--- 4. member CANNOT publish or verify their own listing ---'
do $$ begin
  update public.listings set status='published' where id='22222222-0000-4000-8000-000000000002';
  raise notice 'FAIL: self-publish succeeded';
exception when others then raise notice 'PASS: blocked (%)', SQLERRM;
end $$;
do $$ begin
  update public.listings set verified=true where id='22222222-0000-4000-8000-000000000002';
  raise notice 'FAIL: self-verify succeeded';
exception when others then raise notice 'PASS: blocked (%)', SQLERRM;
end $$;

\echo '--- 5. member CAN edit their own listing content ---'
update public.listings set description='Edited by owner' where id='22222222-0000-4000-8000-000000000002';
select 'member edit applied: ' || (description='Edited by owner') from public.listings where id='22222222-0000-4000-8000-000000000002';

\echo '--- 6. approved member CAN create a listing ---'
insert into public.listings (owner_id, pillar_idx, name) values ('00000000-0000-4000-8000-00000000000b', 2, 'New Member Listing');
select 'insert ok, status defaults to: ' || status from public.listings where name='New Member Listing';
reset role; reset request.jwt.claim.sub;

\echo '--- 7. PENDING applicant CANNOT create a listing ---'
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-00000000000c';
do $$ begin
  insert into public.listings (owner_id, pillar_idx, name) values ('00000000-0000-4000-8000-00000000000c', 0, 'Should Not Exist');
  raise notice 'FAIL: pending applicant listed';
exception when others then raise notice 'PASS: blocked (%)', SQLERRM;
end $$;
reset role; reset request.jwt.claim.sub;

\echo '--- 8. admin sees everything and can vet ---'
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-00000000000a';
select 'admin listings: ' || count(*) || ' (expect 4)' from public.listings;
select 'admin profiles: ' || count(*) || ' (expect 3)' from public.profiles;
update public.profiles set status='approved' where id='00000000-0000-4000-8000-00000000000c';
select 'admin approved applicant: ' || status from public.profiles where id='00000000-0000-4000-8000-00000000000c';
update public.listings set status='published', verified=true where id='22222222-0000-4000-8000-000000000002';
select 'admin published listing: ' || status from public.listings where id='22222222-0000-4000-8000-000000000002';
reset role; reset request.jwt.claim.sub;

\echo '--- 9. member CANNOT steal another members listing ---'
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-00000000000c';
select 'rows applicant can update on someone elses listing: ' || count(*) || ' (expect 0)'
  from public.listings where id='22222222-0000-4000-8000-000000000001' and owner_id = auth.uid();
reset role; reset request.jwt.claim.sub;
