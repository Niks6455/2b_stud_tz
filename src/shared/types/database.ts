export type UserRole = 'manager' | 'executor'

export type TaskStatus =
  | 'new'
  | 'in_progress'
  | 'review'
  | 'rework'
  | 'accepted'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface ConstructionObject {
  id: string
  name: string
  address: string
  created_by: string
  created_at: string
  tasks_count?: number
}

export interface Task {
  id: string
  title: string
  description: string
  object_id: string
  assignee_id: string
  author_id: string
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface TaskStatusHistory {
  id: string
  task_id: string
  from_status: TaskStatus | null
  to_status: TaskStatus
  changed_by: string
  comment: string | null
  created_at: string
}

export interface TaskWithRelations extends Task {
  object?: Pick<ConstructionObject, 'id' | 'name' | 'address'> | null
  assignee?: Pick<Profile, 'id' | 'full_name' | 'email'> | null
  author?: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}

export interface HistoryWithActor extends TaskStatusHistory {
  changer?: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}
