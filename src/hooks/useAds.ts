import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adsService } from '@/services/ads'
import type { CreateAdDto, UpdateAdDto, AdsFilters } from '@/types/ad'

const QUERY_KEY = 'ads'

export function useAds(filters?: AdsFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => adsService.getAll(filters),
  })
}

export function useAd(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => adsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAdDto) => adsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useUpdateAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdDto }) =>
      adsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}

export function useDeleteAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
    },
  })
}

export function useToggleAd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adsService.toggle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
    },
  })
}
