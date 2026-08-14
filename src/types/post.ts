import type { Pagination } from '@/types/ad'

// Estado derivado en backend (filtro de listado)
export type PostStatus = 'published' | 'scheduled' | 'inactive' | 'all'

export interface DebatePost {
  id: string
  authorId: string | null
  imagePath: string
  imageBlurhash: string | null
  imageUrl: string
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

export interface CreatePostDto {
  description: string
  file: File
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
