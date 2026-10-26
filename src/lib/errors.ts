import { isAxiosError } from 'axios'

// El backend responde errores como { error: "mensaje" } (ver API_SPEC.md).
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    return data?.error ?? data?.message ?? fallback
  }
  return fallback
}
