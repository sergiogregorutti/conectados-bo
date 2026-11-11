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

// El cron de notificaciones corre fijo en hora Argentina (09:00 ART), y toda
// la UI de notificaciones (y el calendario que muestra el "Programado") debe
// mostrar/pedir esa misma hora, sin importar en qué huso esté el navegador
// de quien administra. ART no tiene horario de verano desde 2009.
export const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'

export function formatInArgentina(
  date: string | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleString('es-AR', { ...options, timeZone: ARGENTINA_TIME_ZONE })
}

// Convierte una fecha+hora que el admin eligió como "hora Argentina" (ej.
// "2026-11-10" + "09:00") al instante UTC real que representa. No asume un
// offset fijo (aunque ART es siempre UTC-3): mide el corrimiento real vía
// Intl, así que sigue siendo correcto si algún día cambia.
export function argentinaWallTimeToUtcIso(dateStr: string, timeStr: string): string {
  const asIfUtc = new Date(`${dateStr}T${timeStr}:00Z`)
  const tzLocal = new Date(asIfUtc.toLocaleString('en-US', { timeZone: ARGENTINA_TIME_ZONE }))
  const utcLocal = new Date(asIfUtc.toLocaleString('en-US', { timeZone: 'UTC' }))
  const offset = utcLocal.getTime() - tzLocal.getTime()
  return new Date(asIfUtc.getTime() + offset).toISOString()
}
