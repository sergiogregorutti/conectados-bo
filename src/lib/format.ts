export function formatNumber(value: number): string {
  return value.toLocaleString('es-AR')
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%`
}

// Los montos de /revenue vienen en micros (1/1.000.000 de la unidad de la
// moneda) y por moneda: no se suman monedas distintas, se muestran una por una.
export function formatCurrencyMicros(amountMicros: number, currency: string): string {
  const amount = amountMicros / 1_000_000
  try {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })
  } catch {
    return `${amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ${currency}`
  }
}
