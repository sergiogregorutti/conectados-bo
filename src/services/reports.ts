import { api } from '@/lib/axios'
import type {
  DiscardReportDto,
  DiscardReportResponse,
  ReportedUserDetail,
  ReportsUsersFilters,
  ReportsUsersListResponse,
} from '@/types/report'

export const reportsService = {
  async getUsers(filters?: ReportsUsersFilters): Promise<ReportsUsersListResponse> {
    const response = await api.get<ReportsUsersListResponse>('/admin/reports/users', {
      params: {
        search: filters?.search || undefined,
        status: filters?.status,
        page: filters?.page,
        limit: filters?.limit,
      },
    })
    return response.data
  },

  async getUserDetail(userId: string): Promise<ReportedUserDetail> {
    const response = await api.get<ReportedUserDetail>(`/admin/reports/users/${userId}`)
    return response.data
  },

  async discard(reportId: string, data?: DiscardReportDto): Promise<DiscardReportResponse> {
    const response = await api.post<DiscardReportResponse>(
      `/admin/reports/${reportId}/discard`,
      data ?? {},
    )
    return response.data
  },
}
