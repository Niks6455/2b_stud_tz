export function mapAppError(error: unknown, fallback = 'Что-то пошло не так'): string {
  const message =
    error instanceof Error ? error.message.trim() : String(error ?? '')
  const normalized = message.toLowerCase()

  if (!message) return fallback

  if (normalized.includes('invalid login credentials')) {
    return 'Неверный email или пароль'
  }
  if (normalized.includes('forbidden status transition')) {
    return 'Этот переход статуса запрещён'
  }
  if (normalized.includes('comment is required')) {
    return 'Нужен комментарий при возврате на доработку'
  }
  if (normalized.includes('accepted tasks cannot be modified')) {
    return 'Принятую задачу нельзя изменить'
  }
  if (normalized.includes('executor can only update own tasks')) {
    return 'Можно менять только свои задачи'
  }
  if (normalized.includes('executor can only change task status')) {
    return 'Исполнитель может менять только статус задачи'
  }
  if (normalized.includes('only managers can create tasks')) {
    return 'Создавать задачи может только постановщик'
  }
  if (normalized.includes('assignee must be an executor')) {
    return 'Исполнителем можно назначить только пользователя с ролью исполнитель'
  }
  if (normalized.includes('cannot delete object with existing tasks')) {
    return 'Нельзя удалить объект, пока на нём есть задачи'
  }
  if (normalized.includes('task not found or access denied')) {
    return 'Задача не найдена или нет доступа'
  }
  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return 'Нет связи с сервером. Проверьте интернет'
  }
  if (normalized.includes('row-level security') || normalized.includes('rls')) {
    return 'Недостаточно прав для этого действия'
  }

  // Keep short human-readable DB exceptions without English noise when possible
  if (message.length <= 140 && !/[A-Za-z]{4,}/.test(message)) {
    return message
  }

  return fallback
}
