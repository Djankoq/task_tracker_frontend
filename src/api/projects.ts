import { apiClient } from './client'
import type { ListParams, PageResponse, Project } from '../types'

export interface ProjectListParams extends ListParams {
  sort_by?: 'project_id' | 'name' | 'description'
  name?: string
  member_id?: number
  has_tasks?: boolean
}

export const projectsApi = {
  async list(params: ProjectListParams = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<PageResponse<Project>>('/projects/', { params, signal })
    return data
  },
}
