export interface TaskBackTo {
  to: string
  label: string
}

export function backToFromPath(
  path: string | null | undefined,
  objectFallback?: { id?: string | null; name?: string | null },
): TaskBackTo {
  if (path?.startsWith('/my-tasks')) {
    return { to: '/my-tasks', label: 'К задачам' }
  }
  if (path?.startsWith('/board')) {
    return { to: '/board', label: 'К канбану' }
  }
  if (path?.startsWith('/dashboard')) {
    return { to: '/dashboard', label: 'К дашборду' }
  }
  if (path?.startsWith('/objects/')) {
    return {
      to: path,
      label: objectFallback?.name
        ? `К объекту «${objectFallback.name}»`
        : 'К объекту',
    }
  }
  if (path === '/objects') {
    return { to: '/objects', label: 'К объектам' }
  }

  if (objectFallback?.id) {
    return {
      to: `/objects/${objectFallback.id}`,
      label: objectFallback.name
        ? `К объекту «${objectFallback.name}»`
        : 'К объекту',
    }
  }

  return { to: '/my-tasks', label: 'К задачам' }
}

export function taskLocationState(fromPath: string) {
  return { from: fromPath }
}
