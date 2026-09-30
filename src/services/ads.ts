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
    const response = await api.get<AdsListResponse>(`/admin/campaigns?${params}`)
    return response.data
  },

  async getById(id: string): Promise<AdResponse> {
    const response = await api.get<AdResponse>(`/admin/campaigns/${id}`)
    return response.data
  },

  async create(data: CreateAdDto): Promise<AdResponse> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('type', data.type)
    formData.append('mediaType', data.mediaType)
    formData.append('destinationUrl', data.destinationUrl)
    formData.append('startsAt', data.startsAt)
    formData.append('endsAt', data.endsAt)
    formData.append('isActive', String(data.isActive))
    formData.append('priority', String(data.priority))
    formData.append('swipeFrequency', String(data.swipeFrequency))
    formData.append('file', data.file)
    const response = await api.post<AdResponse>('/admin/campaigns', formData)
    return response.data
  },

  async update(id: string, data: UpdateAdDto): Promise<AdResponse> {
    const response = await api.patch<AdResponse>(`/admin/campaigns/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/campaigns/${id}`)
  },

  async toggle(id: string): Promise<AdResponse> {
    const response = await api.post<AdResponse>(`/admin/campaigns/${id}/toggle`)
    return response.data
  },
}
