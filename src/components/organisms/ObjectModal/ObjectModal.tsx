import { useState } from 'react'
import { Modal } from '@/components/molecules'
import { ObjectForm } from '@/components/organisms/ObjectForm'
import {
  useCreateObject,
  useUpdateObject,
} from '@/features/objects/hooks'
import { mapAppError } from '@/shared/lib/errors'
import type { ObjectModalProps } from './types'

export function ObjectModal({
  open,
  onClose,
  mode = 'create',
  objectId,
  defaultValues,
  onSuccess,
}: ObjectModalProps) {
  const createObject = useCreateObject()
  const updateObject = useUpdateObject()
  const [error, setError] = useState<string | null>(null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Новый объект' : 'Редактировать объект'}
      description={
        mode === 'create'
          ? 'Укажите название стройки и адрес.'
          : 'Обновите данные объекта.'
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <ObjectForm
        key={`${mode}-${objectId ?? 'new'}-${String(open)}`}
        defaultValues={defaultValues}
        submitLabel={mode === 'create' ? 'Создать объект' : 'Сохранить'}
        onCancel={onClose}
        onSubmit={async (values) => {
          setError(null)
          try {
            if (mode === 'create') {
              const object = await createObject.mutateAsync(values)
              onClose()
              onSuccess?.(object.id)
              return
            }
            if (!objectId) throw new Error('Не указан id объекта')
            await updateObject.mutateAsync({ id: objectId, values })
            onClose()
            onSuccess?.(objectId)
          } catch (e) {
            setError(mapAppError(e, 'Не удалось сохранить объект'))
          }
        }}
      />
    </Modal>
  )
}
