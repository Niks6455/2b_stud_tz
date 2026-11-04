const STORAGE_KEY = 'stroy-crm:return-to'

export function saveReturnTo(path: string) {
  if (!isSafeReturnPath(path)) return
  sessionStorage.setItem(STORAGE_KEY, path)
}

export function consumeReturnTo(): string | null {
  const value = sessionStorage.getItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  return value && isSafeReturnPath(value) ? value : null
}

export function peekReturnTo(): string | null {
  const value = sessionStorage.getItem(STORAGE_KEY)
  return value && isSafeReturnPath(value) ? value : null
}

export function resolveReturnTo(
  statePath?: string | null,
  fallback = '/dashboard',
) {
  const candidate = statePath || peekReturnTo() || fallback
  return isSafeReturnPath(candidate) ? candidate : fallback
}

function isSafeReturnPath(path: string) {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/login')
  )
}
