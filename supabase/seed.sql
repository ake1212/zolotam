-- MPUGLOBAL — demo directory content.
--
-- Optional. Run it to give a fresh project something to browse; skip it and
-- the app starts on an empty directory, which is the correct state for a real
-- launch. Every row here is owner-less: a listing's owner must be a real
-- account in auth.users, and seeding fake credentials into an auth table is
-- how demo logins end up shipping to production. Admins can reassign these
-- later, or delete them once real members arrive.
--
-- Safe to re-run: rows are keyed by a fixed uuid and upserted.

insert into public.listings
  (id, owner_id, pillar_idx, name, title, description, services, city, phone, email, verified, status)
values
  ('11111111-0000-4000-8000-000000000001', null, 0,
   'Douala Cement & Hardware',
   'Cement, roofing & site delivery',
   'Wholesale and retail supplier of cement, roofing sheets and site hardware, serving contractors across the Littoral region since 2011.',
   array['Bulk orders', 'Site delivery', 'Quantity surveying'],
   'Douala', '+237 677 402 118', 'sales@doualacement.cm', true, 'published'),

  ('11111111-0000-4000-8000-000000000002', null, 1,
   'Yaoundé Tech Depot',
   'Devices, repair and certified warranty',
   'Phones, laptops and accessories with in-house repair and a twelve-month warranty on every certified device.',
   array['Repairs', 'Trade-in', 'Warranty service'],
   'Yaoundé', '+237 699 512 780', 'hello@ydtech.cm', true, 'published'),

  ('11111111-0000-4000-8000-000000000003', null, 2,
   'Limbe Auto Parts Hub',
   'Genuine and aftermarket vehicle parts',
   'Genuine and aftermarket parts for European and Japanese vehicles, sourced directly from importers at the port.',
   array['Parts sourcing', 'Fitting'],
   'Limbe', '+237 677 220 918', 'parts@limbeauto.cm', false, 'pending'),

  ('11111111-0000-4000-8000-000000000004', null, 3,
   'Bafoussam Fabrics & Style',
   'Bespoke tailoring and fabric supply',
   'Bespoke tailoring and fabric supply, specialising in traditional and contemporary West-African design.',
   array['Bespoke tailoring', 'Fabric supply'],
   'Bafoussam', '+237 694 330 512', 'atelier@bafoussamstyle.cm', true, 'published'),

  ('11111111-0000-4000-8000-000000000005', null, 4,
   'Kribi Catering Collective',
   'Event catering and private chefs',
   'Event catering and private chefs for weddings, corporate functions and family gatherings along the coast.',
   array['Event catering', 'Private chef'],
   'Kribi', '+237 651 884 020', 'book@kribicatering.cm', false, 'published'),

  ('11111111-0000-4000-8000-000000000006', null, 5,
   'Buea Homes & Land',
   'Residential land and property',
   'Residential land and property across the South-West, with full legal documentation handled in-house.',
   array['Land sales', 'Property management'],
   'Buea', '+237 678 145 663', 'office@bueahomes.cm', true, 'published'),

  ('11111111-0000-4000-8000-000000000007', null, 0,
   'Garoua Steel & Roofing',
   'Steel fabrication and roofing installation',
   'Steel fabrication and roofing installation for commercial and residential builds in the North.',
   array['Fabrication', 'Installation'],
   'Garoua', '+237 699 118 204', 'works@garouasteel.cm', false, 'pending'),

  ('11111111-0000-4000-8000-000000000008', null, 1,
   'Douala Mobile Exchange',
   'Buy, sell and trade mobile devices',
   'Buy, sell and trade mobile devices, each with a printed diagnostic report before sale.',
   array['Buy & sell', 'Diagnostics'],
   'Douala', '+237 677 901 344', 'trade@doualamobile.cm', true, 'published'),

  ('11111111-0000-4000-8000-000000000009', null, 8,
   'Ndop Rice Cooperative',
   'Locally grown rice, supplied in bulk',
   'Locally grown rice supplied in bulk to distributors and retailers across the North-West.',
   array['Bulk supply', 'Distribution'],
   'Ndop', '+237 233 401 220', 'coop@ndoprice.cm', true, 'published')

on conflict (id) do update set
  name        = excluded.name,
  title       = excluded.title,
  description = excluded.description,
  services    = excluded.services,
  city        = excluded.city,
  phone       = excluded.phone,
  email       = excluded.email,
  verified    = excluded.verified,
  status      = excluded.status;
