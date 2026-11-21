import { apiClient } from './client'
import type { Summary, StatusCount, RankedProject } from '../types'
export const analyticsApi = {
  async summary(signal?: AbortSignal) {
    return (await apiClient.get<Summary>('/stats/summary', { signal })).data
  },
  async tasksByStatus(signal?: AbortSignal) {
    return (await apiClient.get<StatusCount[]>('/stats/tasks-by-status', { signal })).data
  },
  async topProjects(limit = 5, signal?: AbortSignal) {
    return (await apiClient.get<RankedProject[]>('/reports/top-projects', { params: { limit }, signal })).data
  },
}
