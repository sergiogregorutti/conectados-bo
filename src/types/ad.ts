export type AdType = 'banner' | 'interstitial'
export type MediaType = 'image' | 'video'

export interface Ad {
  id: string
  title: string
  type: AdType
  mediaType: MediaType
  mediaUrl: string
  destinationUrl: string
  startsAt: string // ISO date
  endsAt: string // ISO date
  isActive: boolean
  priority: number
  swipeFrequency: number
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
}

export interface CreateAdDto {
  title: string
  type: AdType
  mediaType: MediaType
  mediaUrl: string
  destinationUrl: string
  startsAt: string
  endsAt: string
  isActive: boolean
  priority: number
  swipeFrequency: number
}

export interface UpdateAdDto extends Partial<CreateAdDto> {}

export interface AdsFilters {
  page?: number
  limit?: number
  type?: AdType
  isActive?: boolean
  search?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API Response types
export interface AdsListResponse {
  data: Ad[]
  pagination: Pagination
}

export interface AdResponse {
  data: Ad
}
