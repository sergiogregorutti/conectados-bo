import { api } from '@/lib/axios'
import type { CreateAdDto, UpdateAdDto, AdsListResponse, AdResponse } from '@/types/ad'

export const adsService = {
  async getAll(filters?: {
    page?: number
    limit?: number
    type?: string
    isActive?: boolean
    search?: string
  }): Promise<AdsListResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.type) params.append('type', filters.type)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.search) params.append('search', filters.search)
    const response = await api.get<AdsListResponse>(`/admin/ads?${params}`)
    return response.data
  },

  async getById(id: string): Promise<AdResponse> {
    const response = await api.get<AdResponse>(`/admin/ads/${id}`)
    return response.data
  },

  async create(data: CreateAdDto): Promise<AdResponse> {
    const response = await api.post<AdResponse>('/admin/ads', data)
    return response.data
  },

  async update(id: string, data: UpdateAdDto): Promise<AdResponse> {
    const response = await api.patch<AdResponse>(`/admin/ads/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/ads/${id}`)
  },

  async toggle(id: string): Promise<AdResponse> {
    const response = await api.post<AdResponse>(`/admin/ads/${id}/toggle`)
    return response.data
  },
}
