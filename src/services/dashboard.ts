import { api } from '@/lib/axios'
import type {
  DashboardFilters,
  DashboardSummary,
  DashboardGrowth,
  DashboardDemographics,
  DashboardEngagement,
  DashboardRevenue,
} from '@/types/dashboard'

function buildParams(filters?: DashboardFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters?.from) params.append('from', filters.from)
  if (filters?.to) params.append('to', filters.to)
  if (filters?.province) params.append('province', filters.province)
  if (filters?.compare) params.append('compare', 'true')
  return params
}

export const dashboardService = {
  async getSummary(filters?: DashboardFilters): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>(
      `/admin/dashboard/summary?${buildParams(filters)}`,
    )
    return response.data
  },

  async getGrowth(filters?: DashboardFilters): Promise<DashboardGrowth> {
    const response = await api.get<DashboardGrowth>(
      `/admin/dashboard/growth?${buildParams(filters)}`,
    )
    return response.data
  },

  async getDemographics(filters?: DashboardFilters): Promise<DashboardDemographics> {
    const response = await api.get<DashboardDemographics>(
      `/admin/dashboard/demographics?${buildParams(filters)}`,
    )
    return response.data
  },

  async getEngagement(filters?: DashboardFilters): Promise<DashboardEngagement> {
    const response = await api.get<DashboardEngagement>(
      `/admin/dashboard/engagement?${buildParams(filters)}`,
    )
    return response.data
  },

  async getRevenue(filters?: DashboardFilters): Promise<DashboardRevenue> {
    const response = await api.get<DashboardRevenue>(
      `/admin/dashboard/revenue?${buildParams(filters)}`,
    )
    return response.data
  },
}
