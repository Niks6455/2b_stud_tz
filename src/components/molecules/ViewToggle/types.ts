export type TasksViewMode = 'list' | 'grid' | 'table'

export interface ViewToggleProps {
  value: TasksViewMode
  onChange: (value: TasksViewMode) => void
}
