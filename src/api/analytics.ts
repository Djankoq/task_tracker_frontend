import { apiClient } from './client'
import type { Summary, TaskStatus } from '../types'

export const analyticsApi = {
  async summary(signal?: AbortSignal) {
    const { data } = await apiClient.get<Summary>('/stats/summary', { signal })
    return data
  },
  async tasksByStatus(signal?: AbortSignal) {
    const { data } = await apiClient.get<{ status: TaskStatus; task_count: number }[]>(
      '/stats/tasks-by-status', { signal },
    )
    return data
  },
  async topProjects(limit = 5, signal?: AbortSignal) {
    const { data } = await apiClient.get<{ project_id: number; name: string; task_count: number }[]>(
      '/reports/top-projects', { params: { limit }, signal },
    )
    return data
  },
}
