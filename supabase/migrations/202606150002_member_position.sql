alter table public.members
add column if not exists position text not null default 'Team Member';

alter table public.members
alter column user_id drop not null;

drop policy if exists "users can insert own member profile" on public.members;

create policy "users can insert own member profile"
on public.members for insert
with check (user_id is null or auth.uid() = user_id);

drop policy if exists "workspace members can delete members" on public.members;

create policy "workspace members can delete members"
on public.members for delete
using (public.is_workspace_member(workspace_id));
