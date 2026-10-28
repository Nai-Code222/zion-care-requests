-- request_type_id was the only integer ID; make it bigint like the rest.
alter table public.care_requests alter column request_type_id type bigint;
alter table public.request_type alter column request_type_id type bigint;
alter sequence public.care_types_id_seq as bigint maxvalue 9223372036854775807;

-- get_care_request returns request_type_id, so its return type must change.
drop function public.get_care_request(text);
create function public.get_care_request(p_reference_code text)
 returns table(reference_code text, first text, last text, phone text, email text, anonymous_flag boolean, no_contact_flag boolean, archived_flag boolean, request_type_id bigint, request_type text, urgency_type_id bigint, urgency text, contact_method_id bigint, contact_method text, status_type_id bigint, status_type text, member_notes text, created_at timestamp with time zone, updated_at timestamp with time zone)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select r.reference_code, r.first, r.last, r.phone, r.email,
         r.anonymous_flag, r.no_contact_flag, r.archived_flag,
         r.request_type_id, rt.request_type,
         r.urgency_type_id, u.urgency,
         r.contact_method_id, cm.contact_method,
         r.status_type_id, s.status_type,
         r.member_notes, r.created_at, r.updated_at
  from public.care_requests r
  join public.request_type rt on rt.request_type_id = r.request_type_id
  join public.urgency_type u on u.urgency_type_id = r.urgency_type_id
  join public.contact_method_types cm on cm.contact_method_type_id = r.contact_method_id
  join public.status_types s on s.status_type_id = r.status_type_id
  where r.reference_code = upper(trim(p_reference_code));  -- tolerate "zc-7k3m-9qxp " as typed
$function$;

-- the argument type is part of the function's identity, so replace rather than alter.
drop function public.submit_care_request(integer, bigint, bigint, text, text, text, text, boolean, boolean, text);
create function public.submit_care_request(p_request_type_id bigint, p_urgency_type_id bigint, p_contact_method_id bigint, p_first text default null, p_last text default null, p_phone text default null, p_email text default null, p_anonymous boolean default false, p_no_contact boolean default false, p_member_notes text default null)
 returns text
 language sql
 security definer
 set search_path to ''
as $function$
  insert into public.care_requests (
    request_type_id, urgency_type_id, contact_method_id, first, last, phone, email,
    anonymous_flag, no_contact_flag, member_notes,
    status_type_id, internal_notes
  ) values (
    p_request_type_id, p_urgency_type_id, p_contact_method_id,
    nullif(trim(p_first), ''), nullif(trim(p_last), ''),
    nullif(trim(p_phone), ''), lower(nullif(trim(p_email), '')),
    p_anonymous, p_no_contact, p_member_notes,
    1, null  -- always starts as "Received", no internal notes
  )
  returning reference_code;
$function$;

-- restore the original grants: callable by app roles, not by PUBLIC
revoke execute on function public.get_care_request(text) from public;
revoke execute on function public.submit_care_request(bigint, bigint, bigint, text, text, text, text, boolean, boolean, text) from public;
grant execute on function public.get_care_request(text) to anon, authenticated, service_role;
grant execute on function public.submit_care_request(bigint, bigint, bigint, text, text, text, text, boolean, boolean, text) to anon, authenticated, service_role;
