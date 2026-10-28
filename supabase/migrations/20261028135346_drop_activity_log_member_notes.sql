-- activity_log.member_notes was meant for the member's own words, but only staff can add
-- activity_log rows. Members write on care_requests.member_notes; updates to them go in member_message.

-- get_request_updates returns the column, so it must be rebuilt without it.
drop function public.get_request_updates(text);

-- also drops its length check constraint
alter table public.activity_log drop column member_notes;

create function public.get_request_updates(p_reference_code text)
 returns table(activity_log_id bigint, reference_code text, old_status_id bigint, old_status text, new_status_id bigint, new_status text, member_message text, "timestamp" timestamp with time zone)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select a.activity_log_id, a.reference_code,
         a.old_status_id, os.status_type,
         a.new_status_id, ns.status_type,
         a.member_message, a."timestamp"
  from public.activity_log a
  join public.status_types os on os.status_type_id = a.old_status_id
  join public.status_types ns on ns.status_type_id = a.new_status_id
  where a.reference_code = upper(trim(p_reference_code))
  order by a."timestamp";
$function$;

-- restore the original grants: callable by app roles, not by PUBLIC
revoke execute on function public.get_request_updates(text) from public;
grant execute on function public.get_request_updates(text) to anon, authenticated, service_role;
