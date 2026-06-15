create extension if not exists "pgcrypto";

create type public.member_role as enum ('owner', 'admin', 'member');
create type public.task_status as enum ('To Do', 'In Progress', 'Review', 'Completed');
create type public.task_priority as enum ('Urgent', 'High', 'Normal', 'Low');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Flowdesk',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  initials text not null,
  role public.member_role not null default 'member',
  position text not null default 'Team Member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#7B68EE',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text not null default '',
  status public.task_status not null default 'To Do',
  priority public.task_priority not null default 'Normal',
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, member_id)
);

create table public.task_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_id uuid not null references public.members(id) on delete cascade,
  actor_id uuid references public.members(id) on delete set null,
  task_id uuid references public.tasks(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references public.members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_assignees;
alter publication supabase_realtime add table public.task_messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.direct_messages;

alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.direct_messages enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.members
    where workspace_id = target_workspace
      and user_id = auth.uid()
  );
$$;

create policy "workspace members can read workspace"
on public.workspaces for select
using (public.is_workspace_member(id) or created_by = auth.uid());

create policy "authenticated users can create workspace"
on public.workspaces for insert
with check (auth.uid() = created_by);

create policy "workspace members can update workspace"
on public.workspaces for update
using (public.is_workspace_member(id))
with check (public.is_workspace_member(id));

create policy "workspace members can read members"
on public.members for select
using (public.is_workspace_member(workspace_id));

create policy "users can insert own member profile"
on public.members for insert
with check (user_id is null or auth.uid() = user_id);

create policy "workspace members can update members"
on public.members for update
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace members can delete members"
on public.members for delete
using (public.is_workspace_member(workspace_id));

create policy "workspace members can read projects"
on public.projects for select
using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage projects"
on public.projects for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace members can read tasks"
on public.tasks for select
using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage tasks"
on public.tasks for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy "workspace members can read task assignees"
on public.task_assignees for select
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_assignees.task_id
      and public.is_workspace_member(tasks.workspace_id)
  )
);

create policy "workspace members can manage task assignees"
on public.task_assignees for all
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_assignees.task_id
      and public.is_workspace_member(tasks.workspace_id)
  )
)
with check (
  exists (
    select 1 from public.tasks
    where tasks.id = task_assignees.task_id
      and public.is_workspace_member(tasks.workspace_id)
  )
);

create policy "workspace members can read task messages"
on public.task_messages for select
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_messages.task_id
      and public.is_workspace_member(tasks.workspace_id)
  )
);

create policy "workspace members can create task messages"
on public.task_messages for insert
with check (
  exists (
    select 1 from public.members
    join public.tasks on tasks.workspace_id = members.workspace_id
    where members.id = task_messages.author_id
      and tasks.id = task_messages.task_id
      and members.user_id = auth.uid()
  )
);

create policy "members can read own notifications"
on public.notifications for select
using (
  exists (
    select 1 from public.members
    where members.id = notifications.recipient_id
      and members.user_id = auth.uid()
  )
);

create policy "workspace members can create notifications"
on public.notifications for insert
with check (public.is_workspace_member(workspace_id));

create policy "members can mark own notifications"
on public.notifications for update
using (
  exists (
    select 1 from public.members
    where members.id = notifications.recipient_id
      and members.user_id = auth.uid()
  )
);

create policy "conversation members can read conversations"
on public.conversations for select
using (public.is_workspace_member(workspace_id));

create policy "workspace members can create conversations"
on public.conversations for insert
with check (public.is_workspace_member(workspace_id));

create policy "conversation members can read membership"
on public.conversation_members for select
using (
  exists (
    select 1 from public.conversations
    where conversations.id = conversation_members.conversation_id
      and public.is_workspace_member(conversations.workspace_id)
  )
);

create policy "workspace members can add conversation membership"
on public.conversation_members for insert
with check (
  exists (
    select 1 from public.conversations
    where conversations.id = conversation_members.conversation_id
      and public.is_workspace_member(conversations.workspace_id)
  )
);

create policy "conversation members can read direct messages"
on public.direct_messages for select
using (
  exists (
    select 1 from public.conversation_members
    join public.members on members.id = conversation_members.member_id
    where conversation_members.conversation_id = direct_messages.conversation_id
      and members.user_id = auth.uid()
  )
);

create policy "conversation members can create direct messages"
on public.direct_messages for insert
with check (
  exists (
    select 1 from public.conversation_members
    join public.members on members.id = conversation_members.member_id
    where conversation_members.conversation_id = direct_messages.conversation_id
      and members.user_id = auth.uid()
      and members.id = direct_messages.author_id
  )
);
