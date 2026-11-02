-- Every status change now leaves a line the member can read on the status lookup. When staff don't
-- write a member_message, the row gets "Status changed to <status> - MM/DD/YYYY". A message staff
-- write themselves is kept as is. Rows where the status doesn't change (the submission row) are left alone.
create or replace function private.activity_log_before_insert()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  new.changed_by := (select auth.uid());
  -- a direct insert gets its old status from the request; inserts from the request trigger already carry it
  if pg_trigger_depth() = 1 then
    select status_type_id into new.old_status_id
    from public.care_requests
    where reference_code = new.reference_code;
  end if;

  -- same local day (Central) as the "Request Created" note
  if nullif(trim(new.member_message), '') is null and new.new_status_id is distinct from new.old_status_id then
    select 'Status changed to ' || s.status_type || ' - '
             || to_char(now() at time zone 'America/Chicago', 'MM/DD/YYYY')
    into new.member_message
    from public.status_types s
    where s.status_type_id = new.new_status_id;
  end if;
  return new;
end;
$function$;
