import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersService, type UserStatusAction } from '@/services/users'
import { getErrorMessage } from '@/lib/errors'
import type { DeleteUserPhotoDto, GrantPremiumDto, RevokePremiumDto, UsersFilters } from '@/types/user'

const QUERY_KEY = 'users'

// El backend devuelve mensajes en inglés para estos casos puntuales; el resto
// de la UI está en español, así que los traducimos para no mezclar idiomas.
const PREMIUM_ERROR_MESSAGES: Record<string, string> = {
  'expiresAt must be a future date': 'La fecha de vencimiento debe ser futura',
  'User has an active paid subscription':
    'El usuario ya tiene una suscripción paga activa (Apple/Google): no se puede otorgar premium manual',
  'User has no active manual premium': 'El usuario no tiene un premium manual activo para cancelar',
  'User not found': 'Usuario no encontrado',
}

function getPremiumErrorMessage(error: unknown, fallback: string): string {
  const raw = getErrorMessage(error, fallback)
  return PREMIUM_ERROR_MESSAGES[raw] ?? raw
}

export function useUsers(filters?: UsersFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => usersService.getAll(filters),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  })
}

// Carga perezosa: solo se pide cuando el admin abre la galería (`enabled`
// controlado por el caller), no junto al detalle de usuario/reporte. Las
// URLs firmadas que devuelve la API duran 1h; staleTime bien por debajo para
// no mostrar una URL vencida si el admin vuelve a abrir el modal más tarde.
export function useUserPhotos(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'photos'],
    queryFn: () => usersService.getPhotos(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000,
  })
}

export function useSetUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: UserStatusAction
      reason?: string
    }) => usersService.setStatus(id, action, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useGrantPremium() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GrantPremiumDto }) =>
      usersService.grantPremium(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success('Premium otorgado correctamente')
    },
    onError: (error) => {
      toast.error(getPremiumErrorMessage(error, 'No se pudo otorgar el premium'))
    },
  })
}

export function useRevokePremium() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RevokePremiumDto }) =>
      usersService.revokePremium(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success('Premium manual cancelado correctamente')
    },
    onError: (error) => {
      toast.error(getPremiumErrorMessage(error, 'No se pudo cancelar el premium manual'))
    },
  })
}

export function useDeleteUserPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      photoId,
      data,
    }: {
      id: string
      photoId: string
      data: DeleteUserPhotoDto
    }) => usersService.deletePhoto(id, photoId, data),
    onSuccess: (_, { id }) => {
      // Invalida ['users', id] como prefijo: cubre tanto el detalle de
      // usuario (moderationLog nuevo) como ['users', id, 'photos'] (la
      // galería, usada igual en el detalle de Reporte).
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success('Foto eliminada correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo eliminar la foto'))
    },
  })
}
