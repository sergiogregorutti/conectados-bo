import { api } from '@/lib/axios'
import type {
  AdminNotificationDetail,
  AudienceCountDto,
  AudienceCountResponse,
  CancelNotificationResponse,
  CreateNotificationDto,
  CreateNotificationResponse,
  NotificationsFilters,
  NotificationsListResponse,
  TestNotificationDto,
  TestNotificationResponse,
  TestNotificationUsersResponse,
} from '@/types/notification'

export const notificationsService = {
  async getAll(filters?: NotificationsFilters): Promise<NotificationsListResponse> {
    const response = await api.get<NotificationsListResponse>('/admin/notifications', {
      params: {
        page: filters?.page,
        limit: filters?.limit,
        status: filters?.status === 'all' ? undefined : filters?.status,
        type: filters?.type === 'all' ? undefined : filters?.type,
      },
    })
    return response.data
  },

  async getById(id: string): Promise<AdminNotificationDetail> {
    const response = await api.get<AdminNotificationDetail>(`/admin/notifications/${id}`)
    return response.data
  },

  async create(data: CreateNotificationDto): Promise<CreateNotificationResponse> {
    const response = await api.post<CreateNotificationResponse>('/admin/notifications', data)
    return response.data
  },

  async audienceCount(data: AudienceCountDto): Promise<AudienceCountResponse> {
    const response = await api.post<AudienceCountResponse>(
      '/admin/notifications/audience-count',
      data,
    )
    return response.data
  },

  async test(
    data: TestNotificationDto,
  ): Promise<TestNotificationResponse | TestNotificationUsersResponse> {
    const response = await api.post<TestNotificationResponse | TestNotificationUsersResponse>(
      '/admin/notifications/test',
      data,
    )
    return response.data
  },

  async cancel(id: string): Promise<CancelNotificationResponse> {
    const response = await api.post<CancelNotificationResponse>(
      `/admin/notifications/${id}/cancel`,
    )
    return response.data
  },
}
