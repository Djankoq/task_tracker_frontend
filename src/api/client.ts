import axios from 'axios'
import type { ApiErrorBody } from '../types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
})

// Set a real session token at runtime when authentication is implemented.
// Never store real tokens in VITE_* variables: they are included in the bundle.
export function setSessionToken(token: string | null) {
  if (token) apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete apiClient.defaults.headers.common.Authorization
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data.message) return error.response.data.message
    if (error.code === 'ECONNABORTED') return 'Сервер не ответил вовремя. Повторите запрос.'
    if (!error.response) return 'Не удалось подключиться к API. Проверьте запуск бэкенда.'
  }
  return 'Не удалось выполнить запрос.'
}
