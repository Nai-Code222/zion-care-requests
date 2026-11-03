-- supabase/seed.sql
--
-- Sample data for a fresh database: the lookup values the app needs, the 3 staff test accounts
-- and 12 sample requests. `npx supabase db reset` runs it after the migrations (see config.toml).
-- Everything here is made up: @example.com emails and 555 phone numbers.
--
-- The reference codes, staff logins and request states match the README's Testing section, so
-- the README works against a seeded database too. Never run this against a database with real data.

-- Triggers off while seeding: the reference-code trigger would replace these fixed codes with
-- random ones, and the timestamp trigger would overwrite the created_at dates. (Foreign keys are
-- also checked by triggers, so they're skipped too; the rows below are consistent by hand.)
set session_replication_role = replica;

-- ---------------------------------------------------------------------------------------------
-- Lookup values. The IDs are fixed: the database wires Received to 1 and Completed to 4.
-- ---------------------------------------------------------------------------------------------

insert into public.request_type (request_type_id, request_type) values
  (1, 'Hospital Visit'),
  (2, 'Meal Delivery'),
  (3, 'Counseling Referral'),
  (4, 'Prayer Support'),
  (5, 'Other');

-- urgency_rank sets the dashboard order: higher is more urgent
insert into public.urgency_type (urgency_type_id, urgency, urgency_rank) values
  (1, 'Routine', 1),
  (2, 'Soon', 2),
  (3, 'Urgent', 3);

insert into public.contact_method_types (contact_method_type_id, contact_method) values
  (1, 'Phone'),
  (2, 'Email'),
  (3, 'Text'),
  (4, 'No Contact');

insert into public.status_types (status_type_id, status_type) values
  (1, 'Received'),
  (2, 'In Review'),
  (3, 'Assigned'),
  (4, 'Completed');

-- ---------------------------------------------------------------------------------------------
-- Staff test accounts. Passwords are the ones in the README; change them before real use.
-- ---------------------------------------------------------------------------------------------

with accounts (id, email, password, full_name) as (
  values
    ('64de60d2-069c-4c1e-a150-1382fd6236d4'::uuid, 'grace.staff@example.com', 'HjXEsOG2rmw_8KPw', 'Grace Thompson'),
    ('dd498afb-f412-4f26-ad4b-64de08fa953e'::uuid, 'marcus.staff@example.com', 'vA2jQKDKRxKeimdx', 'Marcus Bell'),
    ('3ae167e0-3d32-4355-904e-500d7344c3a5'::uuid, 'ruth.staff@example.com', '4sLGc0aMrTDNWJ97', 'Ruth Alvarez')
),
users as (
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  )
  select
    '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
    extensions.crypt(password, extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', full_name, 'email_verified', true), now(), now(),
    '', '', '', ''
  from accounts
  returning id, email
),
identities as (
  -- Supabase Auth signs in email users through their identity row
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), id, id::text,
         jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
         'email', now(), now(), now()
  from users
  returning user_id
)
-- Being signed in isn't enough: staff access comes from this table
insert into public.staff (user_id)
select user_id from identities;

-- ---------------------------------------------------------------------------------------------
-- Sample requests. IDs are left to the database so later requests don't collide.
-- Columns: code, first, last, anonymous, type, status, contact method, urgency, no contact,
-- description, phone, email, received
-- ---------------------------------------------------------------------------------------------

insert into public.care_requests (
  reference_code, first, last, anonymous_flag, request_type_id, status_type_id, contact_method_id,
  urgency_type_id, no_contact_flag, member_notes, phone, email, created_at, updated_at
) values
  ('ZC-C85U-286R', 'Dorothy', 'Hayes', false, 1, 1, 1, 3, false,
   'My husband James was admitted to St. Mary''s after a fall. He would love a visit this week.',
   '(555) 201-4417', null, '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-HQBU-U3UP', 'Kevin', 'Osei', false, 2, 1, 2, 2, false,
   'Recovering from knee surgery and can''t cook for about two weeks. Family of four.',
   null, 'kevin.osei@example.com', '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-XAUH-Y8WU', null, null, true, 4, 1, 4, 1, true,
   'Please pray for my sister as she starts a new job and moves to a new city.',
   null, null, '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-EXS7-FQTH', 'Lena', 'Park', false, 3, 1, 3, 2, false,
   'Looking for a grief counselor after losing my mother last month.',
   '555-308-9920', null, '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-MRER-6EJH', 'Harold', 'Jenkins', false, 1, 1, 2, 2, false,
   'In rehab at Riverside Care Center for the next month. Visitors welcome on weekends.',
   null, 'h.jenkins@example.com', '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-CNDK-2QR4', 'Maria', 'Santos', false, 2, 3, 1, 3, false,
   'New baby arrived early and we are overwhelmed. Any meals would be a huge help.',
   '+1 555 412 7783', null, '2026-10-28 13:27:22+00', '2026-11-02 17:18:01+00'),
  ('ZC-36K8-EDY9', 'Samuel', 'Wright', false, 5, 1, 2, 1, false,
   'Need help getting rides to dialysis on Tuesdays and Thursdays.',
   null, 'sam.wright@example.com', '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-PS2U-7GFX', 'Janet', 'Cole', false, 4, 1, 3, 2, false,
   'Prayer for my son who is deploying overseas next month.',
   '555-776-0134', null, '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-JEC7-YEQ6', null, null, true, 3, 1, 4, 1, true,
   'Would like information on marriage counseling options.',
   null, null, '2026-10-28 13:27:22+00', '2026-10-28 13:27:22+00'),
  ('ZC-ASA6-TTN6', 'Bernice', 'Greene', false, 2, 2, 2, 1, false,
   'Living alone after my husband passed. A meal now and then would mean a lot.',
   null, 'bernice.greene@example.com', '2026-10-28 13:27:22+00', '2026-11-02 04:14:39+00'),
  ('ZC-CFF7-S36A', null, null, true, 1, 1, 4, 2, true,
   'A family member is having surgery on Friday. A visit afterward would be a comfort.',
   null, null, '2026-10-31 10:57:41+00', '2026-10-31 10:57:41+00'),
  ('ZC-QKUR-HNQH', 'Denise', 'Carter', false, 4, 1, 1, 2, false,
   'Please pray for my family as we care for my father through his treatment.',
   '555-640-2281', null, '2026-10-31 12:43:57+00', '2026-10-31 12:43:57+00');

-- ---------------------------------------------------------------------------------------------
-- History: Marcus moved ZC-ASA6-TTN6 to In Review and ZC-CNDK-2QR4 to Assigned, each with a note
-- for the member and an internal note. The README uses them to show internal notes staying off
-- the status lookup. Each request's status and updated_at above match its latest row here.
-- ---------------------------------------------------------------------------------------------

insert into public.activity_log (reference_code, old_status_id, new_status_id, timestamp, internal_notes, member_message, changed_by)
values
  ('ZC-ASA6-TTN6', 1, 2, '2026-11-02 04:14:39+00',
   'Assigned to the Thursday meal team. Prefers drop-off after 2pm.',
   'Our meal team is reviewing your request and will reach out this week.',
   'dd498afb-f412-4f26-ad4b-64de08fa953e'),
  ('ZC-CNDK-2QR4', 1, 3, '2026-11-02 17:18:01+00',
   'Meal train set up with the Greenbelt hospitality team, dinners Mon/Wed/Fri for two weeks.',
   'A volunteer from our meal team will call you to arrange the first delivery.',
   'dd498afb-f412-4f26-ad4b-64de08fa953e');

set session_replication_role = default;

-- The lookup rows above set their IDs by hand, which doesn't move the ID counters. Point each
-- counter past the highest ID so anything added later gets a fresh one.
select setval(pg_get_serial_sequence('public.request_type', 'request_type_id'), (select max(request_type_id) from public.request_type));
select setval(pg_get_serial_sequence('public.urgency_type', 'urgency_type_id'), (select max(urgency_type_id) from public.urgency_type));
select setval(pg_get_serial_sequence('public.contact_method_types', 'contact_method_type_id'), (select max(contact_method_type_id) from public.contact_method_types));
select setval(pg_get_serial_sequence('public.status_types', 'status_type_id'), (select max(status_type_id) from public.status_types));
