import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { debateService } from '@/services/debate'
import { getErrorMessage } from '@/lib/errors'
import type { CommentsFilters } from '@/types/debateComment'

const QUERY_KEY = 'debate-comments'

export function useComments(filters?: CommentsFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => debateService.getComments(filters),
  })
}

export function useRemoveComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => debateService.removeComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Comentario eliminado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo eliminar el comentario'))
    },
  })
}

export function useApproveComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => debateService.approveComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Comentario aprobado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo aprobar el comentario'))
    },
  })
}
