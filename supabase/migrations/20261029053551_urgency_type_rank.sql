-- Urgency was sorted by urgency_type_id, which only works while the auto-numbered IDs happen to
-- follow priority. An explicit rank keeps the order correct if rows are re-added or a level is inserted.
-- Higher rank = more urgent, so the dashboard sorts by rank descending.

alter table public.urgency_type add column urgency_rank smallint;

-- set by label, not by ID, so this doesn't depend on the IDs it is replacing
update public.urgency_type
set urgency_rank = case urgency
  when 'Routine' then 1
  when 'Soon' then 2
  when 'Urgent' then 3
end;

-- fails the migration if any label above didn't match
alter table public.urgency_type
  alter column urgency_rank set not null,
  add constraint urgency_type_urgency_rank_key unique (urgency_rank),
  add constraint urgency_type_urgency_rank_check check (urgency_rank > 0);
