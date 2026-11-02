-- The member lookup also returns member_notes ("What's on your heart?"), so a member checking
-- back can see what they asked for. Anyone holding the reference code can read it; contact
-- details and internal notes stay out of the lookup.
-- The return type changes, so the function is dropped and recreated rather than replaced.
drop function public.get_care_request(text);
create function public.get_care_request(p_reference_code text)
 returns table(reference_code text, request_type text, status_type_id bigint, status_type text, member_notes text, created_at timestamp with time zone, updated_at timestamp with time zone)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select r.reference_code, rt.request_type,
         r.status_type_id, s.status_type,
         r.member_notes,
         r.created_at, r.updated_at
  from public.care_requests r
  join public.request_type rt on rt.request_type_id = r.request_type_id
  join public.status_types s on s.status_type_id = r.status_type_id
  where r.reference_code = upper(trim(p_reference_code));  -- tolerate "zc-7k3m-9qxp " as typed
$function$;

revoke execute on function public.get_care_request(text) from public;
grant execute on function public.get_care_request(text) to anon, authenticated, service_role;
