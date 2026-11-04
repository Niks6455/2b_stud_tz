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
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    'executor'
  );
  return new;
end;
$$;

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
