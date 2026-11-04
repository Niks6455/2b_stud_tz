import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import {
  objectSchema,
  type ObjectFormValues,
} from '@/features/objects/schemas'
import type { ObjectFormProps } from './types'

export function ObjectForm({
  defaultValues = { name: '', address: '' },
  onSubmit,
  submitLabel = 'Сохранить',
  onCancel,
}: ObjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObjectFormValues>({
    resolver: zodResolver(objectSchema),
    defaultValues,
  })

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
      })}
    >
      <FormField label="Название" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="ЖК «Северный»" {...register('name')} />
      </FormField>
      <FormField label="Адрес" htmlFor="address" error={errors.address?.message}>
        <Input
          id="address"
          placeholder="г. Москва, ул. Строителей, 12"
          {...register('address')}
        />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
