import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'

interface SectionProps {
  title: string
  description?: string
  isLoading: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
  isFetching?: boolean
  children: ReactNode
}

// Envoltorio común para cada tarjeta de sección: título + su propio estado de
// carga/error, independiente del resto (cada sección pide su propio endpoint).
export function Section({
  title,
  description,
  isLoading,
  isError,
  error,
  onRetry,
  isFetching,
  children,
}: SectionProps) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRetry}
          disabled={isLoading || isFetching}
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {isLoading ? (
        <SectionSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm text-destructive">
            {getErrorMessage(error, 'No se pudo cargar esta sección')}
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      ) : (
        children
      )}
    </section>
  )
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  )
}
