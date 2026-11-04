create extension if not exists "pgcrypto";

do $$
declare
  manager_id uuid := '11111111-1111-1111-1111-111111111111';
  executor1_id uuid := '22222222-2222-2222-2222-222222222222';
  executor2_id uuid := '33333333-3333-3333-3333-333333333333';
  object1_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  object2_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  object3_id uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  task1_id uuid := 'd1111111-1111-1111-1111-111111111111';
  task2_id uuid := 'd2222222-2222-2222-2222-222222222222';
  task3_id uuid := 'd3333333-3333-3333-3333-333333333333';
  task4_id uuid := 'd4444444-4444-4444-4444-444444444444';
  task5_id uuid := 'd5555555-5555-5555-5555-555555555555';
begin
  delete from public.task_status_history where task_id in (task1_id, task2_id, task3_id, task4_id, task5_id);
  delete from public.tasks where id in (task1_id, task2_id, task3_id, task4_id, task5_id);
  delete from public.objects where id in (object1_id, object2_id, object3_id);
  delete from auth.identities where user_id in (manager_id, executor1_id, executor2_id);
  delete from auth.users where id in (manager_id, executor1_id, executor2_id);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values
  (
    '00000000-0000-0000-0000-000000000000',
    manager_id,
    'authenticated',
    'authenticated',
    'manager@crm.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Анна Постановщик","role":"manager"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    executor1_id,
    'authenticated',
    'authenticated',
    'executor1@crm.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Иван Исполнитель","role":"executor"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    executor2_id,
    'authenticated',
    'authenticated',
    'executor2@crm.local',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Пётр Исполнитель","role":"executor"}'::jsonb,
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values
  (
    manager_id, manager_id,
    format('{"sub":"%s","email":"manager@crm.local"}', manager_id)::jsonb,
    'email', manager_id::text, now(), now(), now()
  ),
  (
    executor1_id, executor1_id,
    format('{"sub":"%s","email":"executor1@crm.local"}', executor1_id)::jsonb,
    'email', executor1_id::text, now(), now(), now()
  ),
  (
    executor2_id, executor2_id,
    format('{"sub":"%s","email":"executor2@crm.local"}', executor2_id)::jsonb,
    'email', executor2_id::text, now(), now(), now()
  );

  update public.profiles set
    full_name = 'Анна Постановщик',
    role = 'manager',
    email = 'manager@crm.local'
  where id = manager_id;

  update public.profiles set
    full_name = 'Иван Исполнитель',
    role = 'executor',
    email = 'executor1@crm.local'
  where id = executor1_id;

  update public.profiles set
    full_name = 'Пётр Исполнитель',
    role = 'executor',
    email = 'executor2@crm.local'
  where id = executor2_id;

  insert into public.objects (id, name, address, created_by) values
  (object1_id, 'ЖК «Северный»', 'г. Москва, ул. Строителей, 12', manager_id),
  (object2_id, 'БЦ «Горизонт»', 'г. Москва, пр-т Мира, 45', manager_id),
  (object3_id, 'Школа №128', 'г. Химки, ул. Победы, 3', manager_id);

  alter table public.tasks disable trigger tasks_enforce_insert;

  insert into public.tasks (id, title, description, object_id, assignee_id, author_id, status) values
  (
    task1_id,
    'Разметка фундамента',
    'Выполнить разметку осей здания по проекту.',
    object1_id, executor1_id, manager_id, 'new'
  ),
  (
    task2_id,
    'Заливка плиты',
    'Подготовить опалубку и залить плиту перекрытия 1 этажа.',
    object1_id, executor1_id, manager_id, 'in_progress'
  ),
  (
    task3_id,
    'Монтаж окон',
    'Установить окна на 2–3 этажах, проверить герметичность.',
    object2_id, executor2_id, manager_id, 'review'
  ),
  (
    task4_id,
    'Электропроводка коридоров',
    'Проложить кабель, установить щитки. Вернули на доработку.',
    object2_id, executor2_id, manager_id, 'rework'
  ),
  (
    task5_id,
    'Отделка фасада',
    'Завершить облицовку южного фасада.',
    object3_id, executor1_id, manager_id, 'accepted'
  );

  alter table public.tasks enable trigger tasks_enforce_insert;

  delete from public.task_status_history
  where task_id in (task1_id, task2_id, task3_id, task4_id, task5_id);

  insert into public.task_status_history (task_id, from_status, to_status, changed_by, comment, created_at) values
  (task1_id, null, 'new', manager_id, 'Задача создана', now() - interval '5 days'),
  (task2_id, null, 'new', manager_id, 'Задача создана', now() - interval '4 days'),
  (task2_id, 'new', 'in_progress', executor1_id, null, now() - interval '3 days'),
  (task3_id, null, 'new', manager_id, 'Задача создана', now() - interval '6 days'),
  (task3_id, 'new', 'in_progress', executor2_id, null, now() - interval '5 days'),
  (task3_id, 'in_progress', 'review', executor2_id, null, now() - interval '1 day'),
  (task4_id, null, 'new', manager_id, 'Задача создана', now() - interval '7 days'),
  (task4_id, 'new', 'in_progress', executor2_id, null, now() - interval '6 days'),
  (task4_id, 'in_progress', 'review', executor2_id, null, now() - interval '4 days'),
  (task4_id, 'review', 'rework', manager_id, 'Не хватает схем щитов, доделайте комплектацию.', now() - interval '2 days'),
  (task5_id, null, 'new', manager_id, 'Задача создана', now() - interval '10 days'),
  (task5_id, 'new', 'in_progress', executor1_id, null, now() - interval '9 days'),
  (task5_id, 'in_progress', 'review', executor1_id, null, now() - interval '5 days'),
  (task5_id, 'review', 'accepted', manager_id, 'Принято, отличная работа.', now() - interval '4 days');
end;
$$;
