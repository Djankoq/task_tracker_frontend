import { apiClient } from './client'
import type { PageResponse } from '../types'
export function crudService<T, Create, Update, Params extends object>(resource: string) {
  function path(id: number) {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error('Некорректный ID записи.')
    return '/' + resource + '/' + id
  }
  return {
    async getAll(params: Params, signal?: AbortSignal) {
      return (await apiClient.get<PageResponse<T>>('/' + resource + '/', { params, signal })).data
    },
    async getById(id: number, signal?: AbortSignal) {
      return (await apiClient.get<T>(path(id), { signal })).data
    },
    async create(payload: Create) {
      return (await apiClient.post<T>('/' + resource + '/', payload)).data
    },
    async update(id: number, payload: Update) {
      return (await apiClient.put<T>(path(id), payload)).data
    },
    async delete(id: number) { await apiClient.delete(path(id)) },
  }
}
