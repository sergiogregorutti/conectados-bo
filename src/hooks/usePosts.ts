import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { debateService } from '@/services/debate'
import type { CreatePostDto, UpdatePostDto, PostsFilters } from '@/types/post'

const QUERY_KEY = 'debate-posts'

export function usePosts(filters?: PostsFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => debateService.getPosts(filters),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostDto) => debateService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
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
  })
}
