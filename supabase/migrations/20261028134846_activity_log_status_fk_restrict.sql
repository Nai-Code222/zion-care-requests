-- Deleting a status used to rewrite matching activity_log rows to status 1 (on delete set default),
-- silently changing history. Block the delete instead, matching care_requests.
alter table public.activity_log
  drop constraint activity_log_old_status_id_fkey,
  add constraint activity_log_old_status_id_fkey foreign key (old_status_id)
    references public.status_types(status_type_id) on update cascade on delete restrict;

alter table public.activity_log
  drop constraint activity_log_new_status_id_fkey,
  add constraint activity_log_new_status_id_fkey foreign key (new_status_id)
    references public.status_types(status_type_id) on update cascade on delete restrict;
