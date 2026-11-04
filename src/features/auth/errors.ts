import { mapAppError } from '@/shared/lib/errors'

export function mapAuthError(error: unknown): string {
  return mapAppError(error, 'Не удалось войти. Проверьте данные и попробуйте снова')
}
