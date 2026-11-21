import { apiClient } from './client'
import { crudService } from './crud'
import type { ListParams, Project, ProjectDraft, ProjectMember } from '../types'
export const projectSortFields = ['project_id', 'name', 'description'] as const
export interface ProjectListParams extends ListParams {
  sort_by?: typeof projectSortFields[number]; name?: string; member_id?: number; has_tasks?: boolean
}
export const projectsApi = {
  ...crudService<Project, ProjectDraft, ProjectDraft, ProjectListParams>('projects'),
  async members(id: number, signal?: AbortSignal) {
    return (await apiClient.get<ProjectMember[]>('/projects/' + id + '/members', { signal })).data
  },
}
