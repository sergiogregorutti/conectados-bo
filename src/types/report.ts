import type { Pagination } from './ad'

export type ReportReason =
  | 'INAPPROPRIATE_CONTENT'
  | 'HARASSMENT'
  | 'FAKE_PROFILE'
  | 'SPAM'
  | 'UNDERAGE'
  | 'OTHER'

export type ReportResolution = 'PENDING' | 'DISMISSED' | 'ACTIONED'
export type ReportsFilterStatus = 'pending' | 'all'

export const REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: 'Contenido inapropiado',
  HARASSMENT: 'Acoso',
  FAKE_PROFILE: 'Perfil falso',
  SPAM: 'Spam',
  UNDERAGE: 'Menor de edad',
  OTHER: 'Otro',
}

export interface ReportedUserSummary {
  user: {
    id: string
    name: string | null
    email: string | null
    photoUrl: string | null
    disabled: boolean
  }
  pendingCount: number
  totalCount: number
  lastReportAt: string
  reasons: ReportReason[]
}

export interface ReportsUsersFilters {
  search?: string
  status?: ReportsFilterStatus
  page?: number
  limit?: number
}

export interface ReportsUsersListResponse {
  users: ReportedUserSummary[]
  pagination: Pagination
}

export interface ReportComment {
  id: string
  text: string
  status: string
}

export interface Report {
  id: string
  reason: ReportReason
  details: string | null
  createdAt: string
  resolution: ReportResolution
  resolvedAt: string | null
  resolvedById: string | null
  resolutionNote: string | null
  reporter: {
    id: string
    name: string | null
    photoUrl: string | null
  }
  comment: ReportComment | null
}

export interface ReportedUserDetail {
  user: {
    id: string
    name: string | null
    email: string | null
    photoUrl: string | null
    disabled: boolean
    disabledAt: string | null
  }
  reports: Report[]
}

export interface DiscardReportDto {
  note?: string // max 500
}

export interface DiscardReportResponse {
  id: string
  resolution: 'DISMISSED'
  resolvedAt: string
}
