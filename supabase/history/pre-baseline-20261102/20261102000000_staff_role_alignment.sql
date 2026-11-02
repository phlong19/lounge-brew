-- Match the current staff form and deployed two-role model. Never reassign accounts silently.
alter table public.staff_members drop constraint staff_members_role_check;
alter table public.staff_members add constraint staff_members_role_check check(role in ('admin','editor'));
notify pgrst,'reload schema';
