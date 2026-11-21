export interface User { user_id: number; login: string; display_name: string; is_admin: boolean }
export interface UserCreate { login: string; display_name: string; is_admin: boolean; password: string }
export type UserUpdate = Omit<UserCreate, 'password'> & { password?: string }
export interface Project { project_id: number; name: string; description: string }
export type ProjectDraft = Omit<Project, 'project_id'>
export type ProjectRole = 'manager' | 'executor' | 'observer'
export interface ProjectMember {
  project_id: number; user_id: number; role: ProjectRole; removed_at: string | null
  login: string; display_name: string
}
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export interface Task {
  task_id: number; project_id: number; assignee_id: number; title: string
  description: string; due_at: string; priority: TaskPriority; status: TaskStatus
}
export type TaskCreate = Omit<Task, 'task_id' | 'status'>
export type TaskUpdate = Omit<Task, 'task_id' | 'project_id'> & { review_reason?: string }
export interface TaskComment { comment_id: number; task_id: number; author_id: number; body: string; created_at: string }
export interface TaskChange {
  change_id: number; task_id: number; actor_id: number; changed_at: string
  old_status: TaskStatus | null; new_status: TaskStatus | null
  old_assignee_id: number | null; new_assignee_id: number | null
  old_priority: TaskPriority | null; new_priority: TaskPriority | null
  old_due_at: string | null; new_due_at: string | null
}
// Public session metadata only: no token hashes or password hashes.
export interface AuthSession {
  session_id: number; user_id: number; created_at: string; expires_at: string; revoked_at: string | null
}
export interface PageResponse<T> { items: T[]; total: number; page: number; per_page: number; total_pages: number }
export interface ListParams { page?: number; per_page?: number; search?: string; sort_order?: 'asc' | 'desc' }
export interface ValidationIssue { loc: (string | number)[]; msg: string; type: string }
export interface ApiErrorBody { code: string; message: string; details: ValidationIssue[] }
export interface Summary { total_projects: number; total_tasks: number; avg_tasks_per_project: number | null }
export interface StatusCount { status: TaskStatus; task_count: number }
export interface RankedProject { project_id: number; name: string; task_count: number }
