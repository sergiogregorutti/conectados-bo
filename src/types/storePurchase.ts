export type StoreProvider = 'GOOGLE' | 'APPLE'

export interface StorePurchaseDto {
  provider: StoreProvider
  // GOOGLE: purchaseToken ("Copiar el token de compra" en Play Console).
  // APPLE: transactionId.
  receipt: string
}

export interface RegisterStorePurchaseDto extends StorePurchaseDto {
  userId?: string
  note?: string
}

export interface StorePurchaseLookup {
  provider: StoreProvider
  productId: string
  plan: string
  status: string
  startedAt: string
  expiresAt: string
  isInTrial: boolean
  autoRenewEnabled: boolean
  externalId: string
  latestTransactionId: string | null
  receiptUserId: string | null
  receiptUserExists: boolean
  registeredUserId: string | null
}

export interface RegisterStorePurchaseResponse {
  userId: string
  subscriptionId: string
  isPremium: boolean
  premiumUntil: string | null
}
