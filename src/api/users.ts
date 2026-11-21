import { apiClient } from './client'
import type { ListParams, PageResponse, User } from '../types'

export interface UserListParams extends ListParams {
  sort_by?: 'user_id' | 'login' | 'display_name' | 'name' | 'is_admin'
  is_admin?: boolean
  is_active?: boolean
  project_id?: number
}

export const usersApi = {
  async list(params: UserListParams = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<PageResponse<User>>('/users/', { params, signal })
    return data
  },
  async me(signal?: AbortSignal) {
    const { data } = await apiClient.get<User>('/users/me', { signal })
    return data
  },
}

// The backend currently has no create/update/get-by-id user endpoints.
// UserForm uses the demo store until these endpoints are implemented.
