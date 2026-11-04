import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Укажите название'),
  description: z.string().trim(),
  object_id: z.string().min(1, 'Выберите объект'),
  assignee_id: z.string().min(1, 'Выберите исполнителя'),
})

export type TaskFormValues = z.infer<typeof taskSchema>
