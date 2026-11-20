import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard'
import type { DashboardFilters } from '@/types/dashboard'

const QUERY_KEY = 'dashboard'

// Cada hook sólo toma del filtro global los campos que su endpoint usa (ver
// admin-dashboard.md): así, al cambiar un filtro que no le aplica a una
// sección, su query key no cambia y React Query no la vuelve a pedir. Esto
// es lo que logra "sólo se refetchean las secciones afectadas, en paralelo".

export function useDashboardSummary(filters: DashboardFilters) {
  const applied = { province: filters.province }
  return useQuery({
    queryKey: [QUERY_KEY, 'summary', applied],
    queryFn: () => dashboardService.getSummary(applied),
  })
}

export function useDashboardGrowth(filters: DashboardFilters) {
  const applied = {
    from: filters.from,
    to: filters.to,
    province: filters.province,
    compare: filters.compare,
  }
  return useQuery({
    queryKey: [QUERY_KEY, 'growth', applied],
    queryFn: () => dashboardService.getGrowth(applied),
  })
}

export function useDashboardDemographics(filters: DashboardFilters) {
  const applied = { province: filters.province }
  return useQuery({
    queryKey: [QUERY_KEY, 'demographics', applied],
    queryFn: () => dashboardService.getDemographics(applied),
  })
}

export function useDashboardEngagement(filters: DashboardFilters) {
  const applied = {
    from: filters.from,
    to: filters.to,
    province: filters.province,
    compare: filters.compare,
  }
  return useQuery({
    queryKey: [QUERY_KEY, 'engagement', applied],
    queryFn: () => dashboardService.getEngagement(applied),
  })
}

export function useDashboardRevenue(filters: DashboardFilters) {
  const applied = {
    from: filters.from,
    to: filters.to,
    province: filters.province,
    compare: filters.compare,
  }
  return useQuery({
    queryKey: [QUERY_KEY, 'revenue', applied],
    queryFn: () => dashboardService.getRevenue(applied),
  })
}

// Opciones para el select de provincia: una sola vez, sin filtro, para no
// perder el resto de provincias cuando ya hay una elegida.
export function useDashboardProvinceOptions() {
  const { data, ...rest } = useQuery({
    queryKey: [QUERY_KEY, 'demographics', 'provinces'],
    queryFn: () => dashboardService.getDemographics({}),
    staleTime: 5 * 60 * 1000,
  })

  const provinces = (data?.byProvince ?? [])
    .map((p) => p.province)
    .filter((p): p is string => !!p)
    .sort((a, b) => a.localeCompare(b))

  return { provinces, ...rest }
}
