import { z } from 'zod'

export const objectSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название'),
  address: z.string().trim().min(1, 'Укажите адрес'),
})

export type ObjectFormValues = z.infer<typeof objectSchema>
