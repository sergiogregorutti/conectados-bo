import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { notificationsService } from '@/services/notifications'
import { getErrorMessage } from '@/lib/errors'
import type {
  AudienceCountDto,
  CreateNotificationDto,
  NotificationsFilters,
  TestNotificationDto,
} from '@/types/notification'

const QUERY_KEY = 'notifications'

const NOTIFICATION_ERROR_MESSAGES: Record<string, string> = {
  'Duplicate notification': 'Ya enviaste este mismo mensaje hace menos de 1 minuto',
}

function getNotificationErrorMessage(error: unknown, fallback: string): string {
  const raw = getErrorMessage(error, fallback)
  return NOTIFICATION_ERROR_MESSAGES[raw] ?? raw
}

export function useNotifications(filters?: NotificationsFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => notificationsService.getAll(filters),
  })
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => notificationsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Notificación programada correctamente')
    },
    onError: (error) => {
      toast.error(getNotificationErrorMessage(error, 'No se pudo crear la notificación'))
    },
  })
}

// Es un POST (audience es un objeto anidado), pero conceptualmente es una
// consulta: se modela como mutation para dispararla a demanda (al tocar
// "Ver audiencia"), no automáticamente al montar el form.
export function useAudienceCount() {
  return useMutation({
    mutationFn: (data: AudienceCountDto) => notificationsService.audienceCount(data),
    onError: (error) => {
      toast.error(getNotificationErrorMessage(error, 'No se pudo calcular la audiencia'))
    },
  })
}

export function useTestNotification() {
  return useMutation({
    mutationFn: (data: TestNotificationDto) => notificationsService.test(data),
    onSuccess: (result) => {
      if ('results' in result) {
        const sent = result.results.filter((r) => r.sent).length
        const failed = result.results.length - sent
        if (sent > 0) {
          toast.success(`Prueba enviada a ${sent} usuario${sent === 1 ? '' : 's'}`)
        }
        if (failed > 0) {
          toast.error(`No se pudo enviar a ${failed} usuario${failed === 1 ? '' : 's'}`)
        }
        return
      }
      if (result.mobile || result.web) {
        toast.success('Notificación de prueba enviada a tu dispositivo')
      } else {
        toast.error('No se pudo entregar la notificación de prueba por ningún canal')
      }
    },
    onError: (error) => {
      toast.error(
        getNotificationErrorMessage(
          error,
          'No se pudo enviar la prueba: no tenés ningún canal activo (push o web) en tu cuenta',
        ),
      )
    },
  })
}

export function useCancelNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success('Envío cancelado correctamente')
    },
    onError: (error) => {
      toast.error(getNotificationErrorMessage(error, 'No se pudo cancelar el envío'))
    },
  })
}
