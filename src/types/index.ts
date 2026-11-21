export interface User {
  user_id: number
  login: string
  display_name: string
  is_admin: boolean
}

export type UserDraft = Omit<User, 'user_id'>

export interface Project {
  project_id: number
  name: string
  description: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  task_id: number
  project_id: number
  assignee_id: number
  title: string
  description: string
  due_at: string
  priority: TaskPriority
  status: TaskStatus
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  sort_order?: 'asc' | 'desc'
}

export interface ApiErrorBody {
  code: string
  message: string
  details: { loc: (string | number)[]; msg: string; type: string }[]
}

export interface Summary {
  total_projects: number
  total_tasks: number
  avg_tasks_per_project: number | null
}
