import type { PostgrestError } from '@supabase/supabase-js'

export class ApiError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

export function unwrap<T>(result: {
  data: T
  error: PostgrestError | null
}): NonNullable<T> {
  if (result.error) {
    throw new ApiError(result.error.message, result.error.code)
  }
  return result.data as NonNullable<T>
}
