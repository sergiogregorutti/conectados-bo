import type { Pagination } from '@/types/ad'

export type CommentStatus = 'VISIBLE' | 'FLAGGED' | 'REMOVED'

// Filtro de listado (distinto del status real del comment): 'reported' trae
// comments con denuncias sin resolver, sea cual sea su status.
export type CommentStatusFilter = 'all' | 'flagged' | 'reported'

export type ReportReason =
  | 'INAPPROPRIATE_CONTENT'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'SPAM'
  | 'UNDERAGE'
  | 'OTHER'

export interface DebateCommentReport {
  id: string
  reason: ReportReason
  details: string | null
  createdAt: string
}

export interface DebateComment {
  id: string
  postId: string
  text: string
  status: CommentStatus
  createdAt: string
  author: { id: string; name: string | null }
  post: { id: string; description: string }
  reports: DebateCommentReport[]
}

export interface CommentsFilters {
  page?: number
  limit?: number
  status?: CommentStatusFilter
  postId?: string
}

export interface CommentsListResponse {
  data: DebateComment[]
  pagination: Pagination
}

export interface CommentResponse {
  data: DebateComment
}
