create extension if not exists "pgcrypto";

create type public.user_role as enum ('manager', 'executor');
create type public.task_status as enum (
  'new',
  'in_progress',
  'review',
  'rework',
  'accepted'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'executor',
  created_at timestamptz not null default now()
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  address text not null check (char_length(trim(address)) > 0),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  object_id uuid not null references public.objects (id) on delete restrict,
  assignee_id uuid not null references public.profiles (id),
  author_id uuid not null references public.profiles (id),
  status public.task_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles (id),
  comment text,
  created_at timestamptz not null default now()
);

create index tasks_object_id_idx on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_status_idx on public.tasks (status);
create index task_status_history_task_id_idx on public.task_status_history (task_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    'executor'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.can_transition(
  p_role public.user_role,
  p_from public.task_status,
  p_to public.task_status,
  p_is_assignee boolean
)
returns boolean
language plpgsql
immutable
as $$
begin
  if p_from = p_to then
    return true;
  end if;

  if p_role = 'manager' then
    return (p_from = 'review' and p_to in ('accepted', 'rework'));
  end if;

  if p_role = 'executor' and p_is_assignee then
    return (
      (p_from = 'new' and p_to = 'in_progress')
      or (p_from = 'in_progress' and p_to = 'review')
      or (p_from = 'rework' and p_to = 'in_progress')
    );
  end if;

  return false;
end;
$$;

create or replace function public.enforce_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_comment text;
  v_is_assignee boolean;
begin
  v_role := public.current_role();
  if v_role is null then
    raise exception 'Not authenticated';
  end if;

  v_is_assignee := (old.assignee_id = auth.uid());
  v_comment := nullif(trim(coalesce(current_setting('app.task_comment', true), '')), '');

  if old.status = 'accepted' and (
    new.status is distinct from old.status
    or new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.assignee_id is distinct from old.assignee_id
    or new.object_id is distinct from old.object_id
  ) then
    raise exception 'Accepted tasks cannot be modified';
  end if;

  if v_role = 'executor' then
    if not v_is_assignee then
      raise exception 'Executor can only update own tasks';
    end if;
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.assignee_id is distinct from old.assignee_id
      or new.object_id is distinct from old.object_id
      or new.author_id is distinct from old.author_id
    then
      raise exception 'Executor can only change task status';
    end if;
  end if;

  if new.assignee_id is distinct from old.assignee_id then
    perform public.assert_assignee_is_executor(new.assignee_id);
  end if;

  if new.status is distinct from old.status then
    if not public.can_transition(v_role, old.status, new.status, v_is_assignee) then
      raise exception 'Forbidden status transition: % -> % for role %',
        old.status, new.status, v_role;
    end if;

    if old.status = 'review' and new.status = 'rework' and v_comment is null then
      raise exception 'Comment is required when returning task for rework';
    end if;

    insert into public.task_status_history (
      task_id, from_status, to_status, changed_by, comment
    ) values (
      new.id, old.status, new.status, auth.uid(), v_comment
    );
  end if;

  return new;
end;
$$;

create trigger tasks_enforce_update
  before update on public.tasks
  for each row execute function public.enforce_task_update();

create or replace function public.log_task_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_status_history (
    task_id, from_status, to_status, changed_by, comment
  ) values (
    new.id, null, new.status, new.author_id, 'Задача создана'
  );
  return new;
end;
$$;

create trigger tasks_log_created
  after insert on public.tasks
  for each row execute function public.log_task_created();

create or replace function public.assert_assignee_is_executor(p_assignee_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_assignee_id and role = 'executor'
  ) then
    raise exception 'Assignee must be an executor';
  end if;
end;
$$;

create or replace function public.enforce_task_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_manager() then
    raise exception 'Only managers can create tasks';
  end if;
  if new.status <> 'new' then
    raise exception 'New tasks must start with status new';
  end if;
  if new.author_id <> auth.uid() then
    raise exception 'Author must be the current user';
  end if;
  perform public.assert_assignee_is_executor(new.assignee_id);
  return new;
end;
$$;

create trigger tasks_enforce_insert
  before insert on public.tasks
  for each row execute function public.enforce_task_insert();

create or replace function public.enforce_object_delete()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.tasks where object_id = old.id) then
    raise exception 'Cannot delete object with existing tasks';
  end if;
  return old;
end;
$$;

create trigger objects_enforce_delete
  before delete on public.objects
  for each row execute function public.enforce_object_delete();

create or replace function public.transition_task(
  p_task_id uuid,
  p_to_status public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.tasks t
    where t.id = p_task_id
      and (public.is_manager() or t.assignee_id = auth.uid())
  ) then
    raise exception 'Task not found or access denied';
  end if;

  perform set_config('app.task_comment', coalesce(p_comment, ''), true);

  update public.tasks
  set status = p_to_status
  where id = p_task_id
  returning * into v_task;

  if v_task is null then
    raise exception 'Task not found or access denied';
  end if;

  return v_task;
end;
$$;

grant execute on function public.transition_task(uuid, public.task_status, text) to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_manager() to authenticated;
