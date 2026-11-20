// Tipos del dashboard de admin (ver conectados-api/admin-dashboard.md, "Contrato v1").

export interface DashboardFilters {
  from?: string // YYYY-MM-DD, hora Argentina
  to?: string // YYYY-MM-DD, hora Argentina
  province?: string
  compare?: boolean
}

// null = ese filtro no aplica a este endpoint (no mostrarlo como filtrado).
export interface DashboardAppliedFilters {
  from: string | null
  to: string | null
  province: string | null
}

export interface DashboardSummary {
  generatedAt: string
  appliedFilters: DashboardAppliedFilters
  registered: {
    today: number
    yesterday: number
    last7d: number
    last30d: number
  }
  onboardingCompletedToday: number
  activeNow: number
  dau: number
  wau: number
  mau: number
  matchesToday: number
  messagesToday: number
  swipesToday: number
  pendingReports: number
  premiumActive: number
  disabledAccounts: number
  deletedToday: number
}

export interface SignupsByDay {
  date: string
  count: number
}

export interface OnboardingFunnelStep {
  step: string
  count: number // parados hoy en este paso
  reached: number // llegaron a este paso o a uno posterior
}

export interface DashboardGrowth {
  appliedFilters: DashboardAppliedFilters
  signupsByDay: SignupsByDay[]
  onboardingFunnel: OnboardingFunnelStep[]
  preregistration: { total: number; redeemed: number }
  previous?: { signups: number }
}

export interface ByProvinceCount {
  province: string | null
  count: number
}

export interface ByGenderCount {
  gender: string | null
  count: number
}

export interface ByAgeRangeCount {
  range: string
  count: number
}

export interface DashboardDemographics {
  appliedFilters: DashboardAppliedFilters
  total: number
  byProvince: ByProvinceCount[]
  byGender: ByGenderCount[]
  byAgeRange: ByAgeRangeCount[]
  incompleteProfiles: { noPhoto: number; noBio: number; noLocation: number }
}

export interface EngagementByDay {
  date: string
  swipes: number
  likes: number
  matches: number
  messages: number
}

export interface PeakHour {
  dow: number // 0 = domingo … 6 = sábado, hora Argentina
  hour: number // 0-23
  count: number
}

export interface DashboardEngagement {
  appliedFilters: DashboardAppliedFilters
  byDay: EngagementByDay[]
  funnel: {
    swipes: number
    likes: number
    matches: number
    conversations: number // matches con al menos un mensaje
    replied: number // matches donde escribieron ambos
  }
  deadMatches: number
  peakHours: PeakHour[]
  previous?: { swipes: number; likes: number; matches: number; messages: number }
}

export interface CurrencyTotal {
  currency: string
  amountMicros: number
}

export interface RevenueByDay {
  date: string
  currency: string
  amountMicros: number
}

export interface DashboardRevenue {
  appliedFilters: DashboardAppliedFilters
  premium: {
    active: number
    new: number
    expiring7d: number
    conversionPct: number
  }
  byPlan: { plan: string; count: number }[]
  byProvider: { provider: string; count: number }[]
  revenueByDay: RevenueByDay[]
  totals: CurrencyTotal[]
  trials: number
  canceledAutoRenewOff: number
  previous?: { newPremium: number; totals: CurrencyTotal[] }
}
