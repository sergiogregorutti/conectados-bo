import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { debateService } from '@/services/debate'
import { getErrorMessage } from '@/lib/errors'
import type {
  CreatePostDto,
  UpdatePostDto,
  PostsFilters,
  ReorderPostImagesDto,
} from '@/types/post'

const QUERY_KEY = 'debate-posts'

export function usePosts(filters?: PostsFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => debateService.getPosts(filters),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => debateService.getPost(id),
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostDto) => debateService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Post creado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo crear el post'))
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
      debateService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Post actualizado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo actualizar el post'))
    },
  })
}

export function useTogglePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      debateService.updatePost(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo cambiar el estado del post'))
    },
  })
}

export function useAddPostImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      debateService.addImages(id, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudieron subir las imágenes'))
    },
  })
}

export function useRemovePostImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
      debateService.removeImage(id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo eliminar la imagen'))
    },
  })
}

export function useReorderPostImages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReorderPostImagesDto }) =>
      debateService.reorderImages(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo guardar el orden'))
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => debateService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Post eliminado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'No se pudo eliminar el post'))
    },
  })
}
