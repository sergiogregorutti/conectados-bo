import type { Pagination } from '@/types/ad'

// Estado derivado en backend (filtro de listado)
export type PostStatus = 'published' | 'scheduled' | 'inactive' | 'all'

export interface DebatePostImage {
  id: string
  url: string // URL firmada
  blurhash: string | null
  order: number
}

export interface DebatePost {
  id: string
  authorId: string | null
  images: DebatePostImage[] // ordenado por `order` asc
  description: string
  publishedAt: string // ISO date
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    comments: number
    reactions: number
  }
}

export const MAX_POST_IMAGES = 6

export interface CreatePostDto {
  description: string
  files: File[] // 1 a MAX_POST_IMAGES, en el orden final de publicación
  publishedAt?: string // ISO date, opcional (default: ahora)
}

export interface UpdatePostDto {
  description?: string
  publishedAt?: string
  isActive?: boolean
}

export interface PostsFilters {
  page?: number
  limit?: number
  status?: PostStatus
}

// API Response types
export interface PostsListResponse {
  data: DebatePost[]
  pagination: Pagination
}

export interface PostResponse {
  data: DebatePost
}

export interface ReorderPostImagesDto {
  order: { id: string; order: number }[]
}
