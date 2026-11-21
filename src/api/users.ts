import { apiClient } from './client'
import { crudService } from './crud'
import type { ListParams, User, UserCreate, UserUpdate } from '../types'
export const userSortFields = ['user_id', 'login', 'display_name', 'name', 'is_admin'] as const
export interface UserListParams extends ListParams {
  sort_by?: typeof userSortFields[number]; is_admin?: boolean; is_active?: boolean; project_id?: number
}
export const usersApi = {
  ...crudService<User, UserCreate, UserUpdate, UserListParams>('users'),
  async me(signal?: AbortSignal) { return (await apiClient.get<User>('/users/me', { signal })).data },
}
