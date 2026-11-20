// Mismos valores de enums de Prisma usados en AudienceFilters.tsx (no hay
// endpoint que los liste), más las etiquetas propias del dashboard.

export const ONBOARDING_STEP_LABELS: Record<string, string> = {
  BASIC_DETAILS: 'Datos básicos',
  PHOTOS: 'Fotos',
  LOCATION_PREFERENCES: 'Ubicación y preferencias',
  PRIVACY: 'Privacidad',
  COMPLETED: 'Completado',
}

export const GENDER_LABELS: Record<string, string> = {
  MALE: 'Hombre',
  FEMALE: 'Mujer',
  NON_BINARY: 'No binario',
  TRANS_MALE: 'Hombre trans',
  TRANS_FEMALE: 'Mujer trans',
}

export const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}
