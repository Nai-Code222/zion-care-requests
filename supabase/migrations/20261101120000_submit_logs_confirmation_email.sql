-- A new request now writes its first activity_log row, inside submit_care_request so the request and
-- its log row are saved together (members can't insert into activity_log themselves).
-- internal_notes records "Request Created - MM/DD/YYYY" for staff on every request. member_message
-- holds the confirmation email the member would get (Story 4 stub, no email service), only when they
-- gave a way to reach them; "No Contact" requests get the row without the email.
-- The greeting uses the member's first name only, and only when they gave one and didn't choose to
-- stay anonymous. member_message is shown on the status lookup, so the last name stays out of it.
-- Same signature, so replace in place (keeps grants). It moves from sql to plpgsql to run two inserts.
create or replace function public.submit_care_request(p_request_type_id bigint, p_urgency_type_id bigint, p_contact_method_id bigint, p_first text default null, p_last text default null, p_phone text default null, p_email text default null, p_anonymous boolean default false, p_no_contact boolean default false, p_member_notes text default null)
 returns text
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_code text;
  v_first text := case when not p_anonymous then nullif(trim(p_first), '') end;
  v_message text;
begin
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
  returning reference_code into v_code;

  -- checked by label too, so a request sent with the "No Contact" method but the flag unset still gets no email
  if not p_no_contact and not exists (
    select 1 from public.contact_method_types
    where contact_method_type_id = p_contact_method_id and contact_method = 'No Contact'
  ) then
    v_message := 'Hello ' || coalesce(v_first, 'Zion Family Member') || ', '
      || 'Your request has been received by the Care Team. Your reference code is ' || v_code || '. '
      || 'Please keep this code: you can use it to check where your request stands and read any '
      || 'updates from the team. A member of the Care Team will review your request and follow up '
      || 'using the contact method you chose. We are grateful you reached out, and we are praying '
      || 'for you. With care, The Zion Care Team';
  end if;

  -- 1 = Received on both sides: this row records the submission, not a status change.
  -- Dates use the church's local day (Central), not the database's UTC day.
  insert into public.activity_log (reference_code, old_status_id, new_status_id, internal_notes, member_message)
  values (
    v_code, 1, 1,
    'Request Created - ' || to_char(now() at time zone 'America/Chicago', 'MM/DD/YYYY'),
    v_message
  );

  return v_code;
end;
$function$;
