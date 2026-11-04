import { supabase } from '@/lib/supabase'
import { unwrap } from '@/shared/lib/query'
import type { ConstructionObject } from '@/shared/types/database'
import type { ObjectFormValues } from './schemas'

type ObjectRow = Omit<ConstructionObject, 'tasks_count'> & {
  tasks?: { count: number }[] | null
}

function mapObject(row: ObjectRow): ConstructionObject {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    created_by: row.created_by,
    created_at: row.created_at,
    tasks_count: row.tasks?.[0]?.count ?? 0,
  }
}

export async function listObjects(): Promise<ConstructionObject[]> {
  const rows = unwrap(
    await supabase
      .from('objects')
      .select('id, name, address, created_by, created_at, tasks(count)')
      .order('created_at', { ascending: false }),
  ) as ObjectRow[]

  return rows.map(mapObject)
}

export async function getObject(id: string): Promise<ConstructionObject> {
  return mapObject(
    unwrap(
      await supabase
        .from('objects')
        .select('id, name, address, created_by, created_at, tasks(count)')
        .eq('id', id)
        .single(),
    ) as ObjectRow,
  )
}

export async function createObject(
  values: ObjectFormValues,
  userId: string,
): Promise<ConstructionObject> {
  return mapObject(
    unwrap(
      await supabase
        .from('objects')
        .insert({
          name: values.name.trim(),
          address: values.address.trim(),
          created_by: userId,
        })
        .select('id, name, address, created_by, created_at, tasks(count)')
        .single(),
    ) as ObjectRow,
  )
}

export async function updateObject(
  id: string,
  values: ObjectFormValues,
): Promise<ConstructionObject> {
  return mapObject(
    unwrap(
      await supabase
        .from('objects')
        .update({
          name: values.name.trim(),
          address: values.address.trim(),
        })
        .eq('id', id)
        .select('id, name, address, created_by, created_at, tasks(count)')
        .single(),
    ) as ObjectRow,
  )
}

export async function deleteObject(id: string): Promise<void> {
  unwrap(await supabase.from('objects').delete().eq('id', id))
}
