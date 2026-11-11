import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reportsService } from '@/services/reports'
import { getErrorMessage } from '@/lib/errors'
import type { DiscardReportDto, ReportsUsersFilters } from '@/types/report'

const QUERY_KEY = 'reports'

export function useReportedUsers(filters?: ReportsUsersFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, 'users', filters],
    queryFn: () => reportsService.getUsers(filters),
  })
}

export function useReportedUserDetail(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'users', userId],
    queryFn: () => reportsService.getUserDetail(userId),
    enabled: !!userId,
  })
}

export function useDiscardReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data?: DiscardReportDto }) =>
      reportsService.discard(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Reporte descartado')
    },
    onError: (error) => {
      // 409: otro admin ya lo resolvió antes. Refrescamos para que la fila
      // muestre el estado real en vez de quedar desactualizada.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.error(
        getErrorMessage(
          error,
          'No se pudo descartar el reporte (puede que ya lo haya resuelto otro admin)',
        ),
      )
    },
  })
}
