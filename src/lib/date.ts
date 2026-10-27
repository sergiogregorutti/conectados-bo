// Parsea "YYYY-MM-DD" como fecha local (no UTC): evita que new Date("2026-10-24")
// se interprete como medianoche UTC y aparezca un día antes en husos negativos.
export function parseLocalDate(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Fin del día (23:59:59.999) en hora local, devuelto como instante ISO/UTC.
// Para fechas de vencimiento tipo "hasta el día X" donde ese día debe quedar
// incluido entero, no cortado a medianoche.
export function endOfDayIso(date: Date): string {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  return end.toISOString()
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}
