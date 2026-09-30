import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService, type UserStatusAction } from '@/services/users'
import type { UsersFilters } from '@/types/user'

const QUERY_KEY = 'users'

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

// TEMPORAL: solo para curar la foto de usuarios de prueba antes del release a
// producción / Apple review. Remover junto con el endpoint en la API.
export function useReplaceUserPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      usersService.replacePhoto(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}
