import { apiClient } from './client'
import type { ListParams, PageResponse, Task, TaskPriority, TaskStatus } from '../types'

export interface TaskListParams extends ListParams {
  sort_by?: 'task_id' | 'project_id' | 'assignee_id' | 'title' | 'due_at' | 'priority' | 'status'
  project_id?: number
  assignee_id?: number
  status?: TaskStatus
  priority?: TaskPriority
  due_from?: string
  due_to?: string
}

export const tasksApi = {
  async list(params: TaskListParams = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<PageResponse<Task>>('/tasks/', { params, signal })
    return data
  },
}
