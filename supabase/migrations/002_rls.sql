alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles p where p.id = auth.uid()));

create policy "objects_select"
  on public.objects for select
  to authenticated
  using (
    public.is_manager()
    or exists (
      select 1 from public.tasks t
      where t.object_id = objects.id and t.assignee_id = auth.uid()
    )
  );

create policy "objects_insert_manager"
  on public.objects for insert
  to authenticated
  with check (public.is_manager() and created_by = auth.uid());

create policy "objects_update_manager"
  on public.objects for update
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy "objects_delete_manager"
  on public.objects for delete
  to authenticated
  using (public.is_manager());

create policy "tasks_select"
  on public.tasks for select
  to authenticated
  using (
    public.is_manager()
    or assignee_id = auth.uid()
  );

create policy "tasks_insert_manager"
  on public.tasks for insert
  to authenticated
  with check (public.is_manager() and author_id = auth.uid());

create policy "tasks_update"
  on public.tasks for update
  to authenticated
  using (
    public.is_manager()
    or assignee_id = auth.uid()
  )
  with check (
    public.is_manager()
    or assignee_id = auth.uid()
  );

create policy "tasks_delete_manager"
  on public.tasks for delete
  to authenticated
  using (public.is_manager());

create policy "history_select"
  on public.task_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_status_history.task_id
        and (public.is_manager() or t.assignee_id = auth.uid())
    )
  );

revoke insert, update, delete on public.task_status_history from authenticated, anon;
grant select on public.task_status_history to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.objects to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
