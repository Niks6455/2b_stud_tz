import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, UserRound } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/atoms'
import { FilterMenu, FormField } from '@/components/molecules'
import { taskSchema, type TaskFormValues } from '@/features/tasks/schemas'
import type { TaskFormProps } from './types'

export function TaskForm({
  objects,
  executors,
  defaultValues,
  lockObjectId,
  onSubmit,
  submitLabel = 'Сохранить',
  onCancel,
}: TaskFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      object_id: '',
      assignee_id: '',
      ...defaultValues,
    },
  })

  const lockedObject = lockObjectId
    ? objects.find((o) => o.id === defaultValues?.object_id)
    : undefined

  const objectOptions = objects.map((o) => ({
    value: o.id,
    label: o.name,
    hint: o.address,
  }))

  const executorOptions = executors.map((e) => ({
    value: e.id,
    label: e.full_name,
    hint: e.email,
    leading: (
      <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
        {e.full_name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    ),
  }))

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
      })}
    >
      <FormField label="Название" htmlFor="title" error={errors.title?.message}>
        <Input id="title" placeholder="Монтаж окон" {...register('title')} />
      </FormField>
      <FormField
        label="Описание"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Что нужно сделать"
          {...register('description')}
        />
      </FormField>

      {lockObjectId ? (
        <>
          <input type="hidden" {...register('object_id')} />
          <div className="rounded-xl border border-line bg-paper px-3.5 py-3">
            <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
              Объект
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {lockedObject?.name ?? 'Текущий объект'}
            </p>
            {lockedObject?.address ? (
              <p className="mt-0.5 text-xs text-ink-muted">
                {lockedObject.address}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <FormField label="Объект" error={errors.object_id?.message}>
          <Controller
            name="object_id"
            control={control}
            render={({ field }) => (
              <FilterMenu
                value={field.value}
                onChange={field.onChange}
                options={objectOptions}
                icon={<Building2 className="size-3.5" />}
                placeholder="Выберите объект"
                className="sm:max-w-none"
              />
            )}
          />
        </FormField>
      )}

      <FormField label="Исполнитель" error={errors.assignee_id?.message}>
        <Controller
          name="assignee_id"
          control={control}
          render={({ field }) => (
            <FilterMenu
              value={field.value}
              onChange={field.onChange}
              options={executorOptions}
              icon={<UserRound className="size-3.5" />}
              placeholder="Выберите исполнителя"
              className="sm:max-w-none"
            />
          )}
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
