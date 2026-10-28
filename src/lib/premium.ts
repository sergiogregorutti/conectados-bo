// El backend puede tardar en bajar `isPremium` a false cuando vence
// `premiumUntil` (hay un cron de por medio), así que no alcanza con confiar
// ciegamente en el booleano: hay que comparar la fecha contra "ahora" acá
// para no seguir mostrando "Premium" a alguien que ya venció.
export type PremiumStatus = 'active' | 'expired' | 'free'

export function getPremiumStatus(user: {
  isPremium: boolean
  premiumUntil: string | null
}): PremiumStatus {
  const isExpired = user.premiumUntil !== null && new Date(user.premiumUntil).getTime() <= Date.now()
  if (isExpired) return 'expired'
  if (user.isPremium) return 'active'
  return 'free'
}
