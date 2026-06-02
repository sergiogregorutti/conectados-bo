import { api } from '@/lib/axios'
import type { UserDetail, UsersFilters, UsersListResponse } from '@/types/user'

export type UserStatusAction = 'enable' | 'disable'

export interface UserStatusResponse {
  id: string
  disabledAt: string | null
}

export const usersService = {
  async getAll(filters?: UsersFilters): Promise<UsersListResponse> {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.premium !== undefined) params.append('premium', String(filters.premium))
    if (filters?.status) params.append('status', filters.status)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)
    const response = await api.get<UsersListResponse>(`/admin/users?${params}`)
    return response.data
  },

  async getById(id: string): Promise<UserDetail> {
    const response = await api.get<UserDetail>(`/admin/users/${id}`)
    return response.data
  },

  async setStatus(
    id: string,
    action: UserStatusAction,
    reason?: string,
  ): Promise<UserStatusResponse> {
    const body = action === 'disable' && reason ? { reason } : {}
    const response = await api.post<UserStatusResponse>(`/admin/users/${id}/${action}`, body)
    return response.data
  },
}
