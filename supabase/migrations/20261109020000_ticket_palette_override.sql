-- Keep the generated colour for Reset; an editor may choose another safe palette.
alter table public.events add column ticket_palette_override text;
comment on column public.events.ticket_palette_override is 'Optional editor-selected static ticket palette key. NULL uses the detected cover palette.';
