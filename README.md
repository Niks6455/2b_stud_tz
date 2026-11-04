# СтройCRM — мини-CRM «Объекты и задачи»

Тестовое задание для строительной компании: постановщики ставят задачи по объектам (стройкам), исполнители выполняют их и отдают на проверку.

## Стек

- React 19 + TypeScript + Vite
- Supabase (Auth + PostgreSQL + RLS)
- TanStack Query, React Hook Form, Zod
- Tailwind CSS 4, Lucide icons
- Atomic Design: atoms → molecules → organisms → pages

## Быстрый старт

### 1. Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. **Authentication → Providers → Email**: включите Email, отключите публичную регистрацию (*Enable sign ups* = off).
3. В **SQL Editor** выполните по порядку:
   - [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql)
   - [`supabase/migrations/002_rls.sql`](supabase/migrations/002_rls.sql)
   - [`supabase/migrations/003_seed.sql`](supabase/migrations/003_seed.sql)
   - [`supabase/migrations/004_realtime.sql`](supabase/migrations/004_realtime.sql)
   - [`supabase/migrations/005_harden_grants.sql`](supabase/migrations/005_harden_grants.sql)
   - [`supabase/migrations/006_secure_defaults.sql`](supabase/migrations/006_secure_defaults.sql)
4. **Project Settings → API**: скопируйте `Project URL` и `anon` `public` key.

### 2. Фронтенд

```bash
cp .env.example .env
# заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Сборка: `npm run build` → `npm run preview`.

### Тестовые учётки (после seed)

| Роль | Email | Пароль |
|------|-------|--------|
| Постановщик | `manager@crm.local` | `Password123!` |
| Исполнитель 1 | `executor1@crm.local` | `Password123!` |
| Исполнитель 2 | `executor2@crm.local` | `Password123!` |

В базе: 3 объекта и 5 задач в статусах «Новая», «В работе», «На проверке», «На доработке», «Принята».

## Экраны

- `/login` — вход
- `/dashboard` — сводка, статистика, «требуют внимания» + live
- `/board` — канбан со сменой статусов drag-and-drop
- `/objects` — список объектов
- `/objects/:id` — карточка объекта и его задачи
- `/tasks/:id` — задача, действия, история
- `/my-tasks` — список задач
- **⌘K** — быстрый поиск по проекту

На уже существующем проекте после обновления репозитория выполните `005` и `006`, если ещё не накатывали.

## Роли и статусы

**Постановщик:** CRUD объектов и задач, назначение исполнителя, принять / вернуть с проверки.

**Исполнитель:** видит только свои задачи и связанные объекты; переходы `Новая → В работе → На проверке`, а также `На доработке → В работе`.

Запрещённые переходы и подделка истории отсекаются на уровне PostgreSQL (триггеры + RLS), не только в UI.

## Структура кода

```
src/
  components/atoms|molecules|organisms
  features/auth|objects|tasks
  pages/
  lib/          # supabase client, status-machine
  shared/       # типы, cn()
supabase/migrations/
```

## Деплой

Любой статический хостинг (Vercel / Netlify):

- Build: `npm run build`
- Output: `dist`
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
