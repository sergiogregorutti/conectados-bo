import type { Pagination } from './ad'

export type UserStatusFilter = 'active' | 'disabled' | 'all'
export type UserSortBy = 'createdAt' | 'premiumUntil' | 'totalSpent'
export type UserSortOrder = 'asc' | 'desc'

export interface UserSpend {
  currency: string
  amount: number
}

export interface User {
  id: string
  name: string | null
  email: string | null
  photoUrl: string | null
  isPremium: boolean
  premiumUntil: string | null
  currentPlan: string | null
  currentProvider: string | null
  totalSpent: UserSpend[]
  swipesCount: number
  matchesCount: number
  disabled: boolean
  disabledAt: string | null
  createdAt: string
}

export interface SubscriptionTransaction {
  type: string
  priceMicros: string
  currency: string
  occurredAt: string
}

export interface Subscription {
  id: string
  provider: string
  plan: string
  status: string
  startedAt: string
  expiresAt: string
  canceledAt: string | null
  autoRenewEnabled: boolean
  isInTrial: boolean
  couponCode: string | null
  transactions: SubscriptionTransaction[]
}

export interface CouponRedemption {
  code: string
  grantDays: number
  redeemedAt: string
}

export interface ModerationLogEntry {
  action: 'DISABLE' | 'ENABLE'
  adminId: string
  reason: string | null
  createdAt: string
}

export interface UserDetail extends User {
  subscriptions: Subscription[]
  couponRedemptions: CouponRedemption[]
  moderationLog: ModerationLogEntry[]
}

export interface UsersFilters {
  search?: string
  premium?: boolean
  status?: UserStatusFilter
  page?: number
  limit?: number
  sortBy?: UserSortBy
  sortOrder?: UserSortOrder
}

export interface UsersListResponse {
  users: User[]
  pagination: Pagination
}
