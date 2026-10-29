import type { Pagination } from './ad'

export type NotificationType = 'ANNOUNCEMENT' | 'REMINDER' | 'DEBATE_POST'
export type CreatableNotificationType = 'ANNOUNCEMENT' | 'REMINDER'
export type NotificationChannel = 'MOBILE' | 'WEB'
export type NotificationStatus = 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELED' | 'FAILED'
export type NotificationsFilterStatus = NotificationStatus | 'all'
export type NotificationsFilterType = NotificationType | 'all'

export type PremiumAudienceFilter = 'ALL' | 'PREMIUM' | 'FREE'
export type OnboardingAudienceFilter = 'COMPLETED' | 'INCOMPLETE'

// Filtros opcionales y combinables (AND). Vacío = todos los usuarios elegibles.
// Un campo desconocido es rechazado con 400 por el backend, así que este tipo
// debe reflejar exactamente lo que el backend soporta (ver notification.md §5).
export interface NotificationAudience {
  premium?: PremiumAudienceFilter
  platform?: NotificationChannel[]
  provinces?: string[]
  genderIdentity?: string[]
  ageMin?: number
  ageMax?: number
  onboarding?: OnboardingAudienceFilter
  onboardingStep?: string[]
}

export interface CreateNotificationDto {
  type: CreatableNotificationType
  title: string // 1-65
  body: string // 1-178
  audience: NotificationAudience
  channels: NotificationChannel[]
  scheduledAt?: string // ISO date-time, futura
}

export interface CreateNotificationResponse {
  id: string
  status: NotificationStatus
  scheduledAt: string
  recipientsCount: number
}

export interface AudienceCountDto {
  audience: NotificationAudience
  channels: NotificationChannel[]
  type: NotificationType
}

export interface AudienceCountResponse {
  total: number
  mobile: number
  web: number
}

export interface TestNotificationDto {
  title: string
  body: string
  channels: NotificationChannel[]
  userIds?: string[] // 1-20 ids únicos; sin esto, prueba en el admin logueado
}

// Sin userIds: prueba al admin logueado.
export interface TestNotificationResponse {
  mobile: boolean
  web: boolean
}

// Con userIds: un resultado por usuario (sent:false si no existe, está
// eliminado/deshabilitado, o no tiene ese canal activo).
export interface TestNotificationUserResult {
  userId: string
  sent: boolean
}

export interface TestNotificationUsersResponse {
  results: TestNotificationUserResult[]
}

export interface AdminNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  status: NotificationStatus
  channels: NotificationChannel[]
  scheduledAt: string
  sentAt: string | null
  recipientsCount: number
  deliveredCount: number
  failedCount: number
  createdAt: string
}

export interface AdminNotificationDetail extends AdminNotification {
  audience: NotificationAudience
  data: Record<string, unknown>
  adminId: string
  startedAt: string | null
}

export interface NotificationsFilters {
  page?: number
  limit?: number
  status?: NotificationsFilterStatus
  type?: NotificationsFilterType
}

export interface NotificationsListResponse {
  notifications: AdminNotification[]
  pagination: Pagination
}

export interface CancelNotificationResponse {
  id: string
  status: 'CANCELED'
}
