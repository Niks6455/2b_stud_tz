import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
