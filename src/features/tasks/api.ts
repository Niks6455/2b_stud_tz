import { supabase } from '@/lib/supabase'
import { unwrap } from '@/shared/lib/query'
import type {
  HistoryWithActor,
  Profile,
  Task,
  TaskStatus,
  TaskWithRelations,
} from '@/shared/types/database'
import type { TaskFormValues } from './schemas'

const TASK_WITH_RELATIONS = `
  id,
  title,
  description,
  object_id,
  assignee_id,
  author_id,
  status,
  created_at,
  updated_at,
  object:objects!object_id (
    id,
    name,
    address
  ),
  assignee:profiles!assignee_id (
    id,
    full_name,
    email
  ),
  author:profiles!author_id (
    id,
    full_name,
    email
  )
`

const HISTORY_WITH_ACTOR = `
  id,
  task_id,
  from_status,
  to_status,
  changed_by,
  comment,
  created_at,
  changer:profiles!changed_by (
    id,
    full_name,
    email
  )
`

function asTasks(data: unknown): TaskWithRelations[] {
  return data as TaskWithRelations[]
}

function asTask(data: unknown): TaskWithRelations {
  return data as TaskWithRelations
}

function asHistory(data: unknown): HistoryWithActor[] {
  return data as HistoryWithActor[]
}

export type ListTasksFilters = {
  objectId?: string
  assigneeId?: string
}

export async function listTasks(
  filters: ListTasksFilters = {},
): Promise<TaskWithRelations[]> {
  let query = supabase
    .from('tasks')
    .select(TASK_WITH_RELATIONS)
    .order('created_at', { ascending: false })

  if (filters.objectId) {
    query = query.eq('object_id', filters.objectId)
  }

  if (filters.assigneeId) {
    query = query.eq('assignee_id', filters.assigneeId)
  }

  return asTasks(unwrap(await query))
}

export async function getTask(id: string): Promise<TaskWithRelations> {
  return asTask(
    unwrap(
      await supabase
        .from('tasks')
        .select(TASK_WITH_RELATIONS)
        .eq('id', id)
        .single(),
    ),
  )
}

export async function createTask(
  values: TaskFormValues,
  authorId: string,
): Promise<Task> {
  return unwrap(
    await supabase
      .from('tasks')
      .insert({
        title: values.title.trim(),
        description: values.description.trim(),
        object_id: values.object_id,
        assignee_id: values.assignee_id,
        author_id: authorId,
        status: 'new',
      })
      .select()
      .single(),
  ) as Task
}

export async function updateTask(
  id: string,
  values: Partial<TaskFormValues>,
): Promise<Task> {
  const patch: Partial<{
    title: string
    description: string
    object_id: string
    assignee_id: string
  }> = {}

  if (values.title !== undefined) patch.title = values.title.trim()
  if (values.description !== undefined) {
    patch.description = values.description.trim()
  }
  if (values.object_id !== undefined) patch.object_id = values.object_id
  if (values.assignee_id !== undefined) patch.assignee_id = values.assignee_id

  return unwrap(
    await supabase.from('tasks').update(patch).eq('id', id).select().single(),
  ) as Task
}

export async function deleteTask(id: string): Promise<void> {
  unwrap(await supabase.from('tasks').delete().eq('id', id))
}

export async function transitionTask(
  taskId: string,
  toStatus: TaskStatus,
  comment?: string,
): Promise<Task> {
  return unwrap(
    await supabase.rpc('transition_task', {
      p_task_id: taskId,
      p_to_status: toStatus,
      p_comment: comment ?? null,
    }),
  ) as Task
}

export async function listTaskHistory(
  taskId: string,
): Promise<HistoryWithActor[]> {
  return asHistory(
    unwrap(
      await supabase
        .from('task_status_history')
        .select(HISTORY_WITH_ACTOR)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true }),
    ),
  )
}

export async function listExecutors(): Promise<Profile[]> {
  return unwrap(
    await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('role', 'executor')
      .order('full_name'),
  ) as Profile[]
}
