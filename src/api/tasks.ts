import { crudService } from './crud'
import type { ListParams, Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../types'
export const taskSortFields = ['task_id', 'project_id', 'assignee_id', 'title', 'due_at', 'priority', 'status'] as const
export interface TaskListParams extends ListParams {
  sort_by?: typeof taskSortFields[number]; project_id?: number; assignee_id?: number
  status?: TaskStatus; priority?: TaskPriority; due_from?: string; due_to?: string
}
export const tasksApi = crudService<Task, TaskCreate, TaskUpdate, TaskListParams>('tasks')
