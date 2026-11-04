import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import {
  EmptyState,
  PageHeader,
  SearchInput,
} from '@/components/molecules'
import { ObjectCard, ObjectModal } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { useObjects } from '@/features/objects/hooks'

export function ObjectsPage() {
  const { profile } = useAuth()
  const { data: objects, isLoading, error } = useObjects()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const isManager = profile?.role === 'manager'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!objects) return []
    if (!q) return objects
    return objects.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q),
    )
  }, [objects, query])

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Объекты"
        description={
          isManager
            ? 'Стройки компании. Создавайте объекты и ставьте задачи.'
            : 'Объекты, где вам назначены задачи.'
        }
        actions={
          isManager ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Новый объект
            </Button>
          ) : null
        }
      />

      <ObjectModal open={creating} onClose={() => setCreating(false)} />

      <div className="mb-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию или адресу"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState
          title="Не удалось загрузить"
          description={error.message}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Объектов пока нет"
          description={
            isManager
              ? 'Создайте первый объект строительства.'
              : 'Когда вам назначат задачу, объект появится здесь.'
          }
          action={
            isManager ? (
              <Button onClick={() => setCreating(true)}>Создать объект</Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {filtered.map((object) => (
            <ObjectCard key={object.id} object={object} />
          ))}
        </div>
      )}
    </div>
  )
}
