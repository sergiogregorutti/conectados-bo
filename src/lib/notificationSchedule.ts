import { formatInArgentina } from './date'

// Si el admin no programó una fecha, el backend igual guarda `scheduledAt`
// con la hora de creación (es el "no antes de" que usa el cron para decidir
// si ya puede salir, no una meta futura elegida a mano). Si está a pocos
// minutos de `createdAt`, es ese caso — no un envío programado de verdad.
const EXPLICIT_SCHEDULE_THRESHOLD_MS = 2 * 60 * 1000

export function wasExplicitlyScheduled(scheduledAt: string, createdAt: string): boolean {
  const diff = Math.abs(new Date(scheduledAt).getTime() - new Date(createdAt).getTime())
  return diff > EXPLICIT_SCHEDULE_THRESHOLD_MS
}

export function formatScheduledLabel(scheduledAt: string, createdAt: string): string {
  if (!wasExplicitlyScheduled(scheduledAt, createdAt)) {
    return 'Sin programar (próximo ciclo de envío)'
  }
  return formatInArgentina(scheduledAt, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
