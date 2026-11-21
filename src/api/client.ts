import axios from 'axios'
import type { ApiErrorBody, ValidationIssue } from '../types'

const TOKEN_KEY = 'task-tracker.session'
function readToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null }
}
let sessionToken = readToken()
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})
const messages: Record<string, string> = {
  'User not found': 'Пользователь не найден.',
  'Project not found': 'Проект не найден или недоступен.',
  'Task not found': 'Задача не найдена или недоступна.',
  'Administrator required': 'Для этой операции нужны права администратора.',
  'Project manager required': 'Для этой операции нужна роль руководителя проекта.',
  'Only a project manager can create tasks': 'Создавать задачи может руководитель проекта.',
  'This user cannot edit the task': 'Изменять задачу может руководитель или назначенный исполнитель.',
  'The assignee must be an active executor of the project': 'Выберите действующего исполнителя этого проекта.',
  'Invalid status transition': 'Этот переход статуса запрещён для вашей роли.',
  'Related records prevent deletion': 'Удаление запрещено: у записи есть связанные данные, комментарии или история.',
  'A record with these unique values already exists': 'Запись с такими уникальными данными уже существует.',
  'Invalid reference to a related record': 'Связанная запись не существует. Обновите данные формы.',
  'You cannot delete your own account': 'Нельзя удалить свою учётную запись.',
  'You cannot remove your own administrator role': 'Нельзя снять с себя роль администратора.',
  'Invalid request data': 'Проверьте введённые данные.',
}
export class ApiError extends Error {
  status: number
  code: string
  details: ValidationIssue[]
  constructor(message: string, status = 0, code = 'network_error', details: ValidationIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}
export function getSessionToken() { return sessionToken }
export function setSessionToken(token: string | null) {
  sessionToken = token
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch { /* The in-memory session still works with disabled browser storage. */ }
}
apiClient.interceptors.request.use((config) => {
  if (sessionToken && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', 'Bearer ' + sessionToken)
  }
  return config
})
apiClient.interceptors.response.use((response) => response, (cause: unknown) => {
  if (axios.isCancel(cause)) return Promise.reject(cause)
  if (!axios.isAxiosError<ApiErrorBody>(cause)) return Promise.reject(cause)
  const status = cause.response?.status || 0
  const body = cause.response?.data
  let message = messages[body?.message || ''] || body?.message || 'Не удалось выполнить запрос.'
  if (status === 401) message = 'Сеанс недействителен или истёк. Подключитесь с действующим токеном.'
  if (status === 403 && !messages[body?.message || '']) message = 'Недостаточно прав для этой операции.'
  if (status >= 500) message = 'Ошибка сервера. Повторите запрос позже.'
  if (!status) message = cause.code === 'ECONNABORTED'
    ? 'Сервер не ответил вовремя. Повторите запрос.'
    : 'Нет связи с API. Проверьте запуск бэкенда и адрес proxy.'
  if (status === 401 && sessionToken && cause.config?.headers.get('Authorization') === 'Bearer ' + sessionToken) {
    setSessionToken(null)
    window.dispatchEvent(new Event('task-tracker:unauthorized'))
  }
  return Promise.reject(new ApiError(message, status, body?.code, Array.isArray(body?.details) ? body.details : []))
})
export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
}
export function getFieldErrors(error: unknown): Record<string, string> {
  const fields: Record<string, string> = {}
  if (error instanceof ApiError) {
    for (const issue of error.details) {
      if (issue.loc[0] === 'body' && typeof issue.loc[1] === 'string') {
        fields[issue.loc[1]] = 'Проверьте значение поля: оно не соответствует требованиям API.'
      }
    }
  }
  return fields
}
export function isCanceled(error: unknown) { return axios.isCancel(error) }
