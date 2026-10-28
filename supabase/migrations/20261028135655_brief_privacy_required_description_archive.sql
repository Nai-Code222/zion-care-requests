-- 1. The member lookup returns status only, never contact details or the description.
--    Anyone holding a reference code can call it, so it must not expose who the member is
--    or what their situation is. Member-facing updates come from get_request_updates.
drop function public.get_care_request(text);
create function public.get_care_request(p_reference_code text)
 returns table(reference_code text, request_type text, status_type_id bigint, status_type text, created_at timestamp with time zone, updated_at timestamp with time zone)
 language sql
 stable security definer
 set search_path to ''
as $function$
  select r.reference_code, rt.request_type,
         r.status_type_id, s.status_type,
         r.created_at, r.updated_at
  from public.care_requests r
  join public.request_type rt on rt.request_type_id = r.request_type_id
  join public.status_types s on s.status_type_id = r.status_type_id
  where r.reference_code = upper(trim(p_reference_code));  -- tolerate "zc-7k3m-9qxp " as typed
$function$;

revoke execute on function public.get_care_request(text) from public;
grant execute on function public.get_care_request(text) to anon, authenticated, service_role;

-- 2. The description (member_notes) is required and can't be only spaces.
alter table public.care_requests
  alter column member_notes set not null,
  add constraint care_requests_member_notes_not_blank check (char_length(trim(member_notes)) > 0);

-- same signature, so replace in place (keeps grants); blank notes now become null and fail the not-null rule
create or replace function public.submit_care_request(p_request_type_id bigint, p_urgency_type_id bigint, p_contact_method_id bigint, p_first text default null, p_last text default null, p_phone text default null, p_email text default null, p_anonymous boolean default false, p_no_contact boolean default false, p_member_notes text default null)
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
    p_anonymous, p_no_contact, nullif(trim(p_member_notes), ''),
    1, null  -- always starts as "Received", no internal notes
  )
  returning reference_code;
$function$;

-- 3. Completed archives the request, and archived_at records when.
alter table public.care_requests add column archived_at timestamp with time zone;

create function private.care_requests_archive_on_complete()
 returns trigger
 language plpgsql
 set search_path to ''
as $function$
begin
  -- 4 = Completed. Reaching it archives; moving off it (reopening) unarchives.
  if tg_op = 'INSERT' then
    new.archived_flag := new.archived_flag or new.status_type_id = 4;
  elsif new.status_type_id is distinct from old.status_type_id then
    new.archived_flag := new.status_type_id = 4;
  end if;

  -- archived_at always follows archived_flag and keeps the original time while archived
  if not new.archived_flag then
    new.archived_at := null;
  elsif tg_op = 'UPDATE' and old.archived_flag then
    new.archived_at := old.archived_at;
  else
    new.archived_at := now();
  end if;
  return new;
end;
$function$;

create trigger care_requests_archive_on_complete
  before insert or update on public.care_requests
  for each row execute function private.care_requests_archive_on_complete();
