import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Variación contra `previous` (sólo visible con compare=true): mismo largo
// de período, terminando donde empieza el actual.
export function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current === 0 ? null : (
      <Badge variant="secondary" className="gap-1">
        <ArrowUp className="h-3 w-3" />
        nuevo
      </Badge>
    )
  }

  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 0.5) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Minus className="h-3 w-3" />
        sin cambios
      </Badge>
    )
  }

  const isUp = pct > 0
  return (
    <Badge variant={isUp ? 'secondary' : 'outline'} className="gap-1">
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(pct).toLocaleString('es-AR', { maximumFractionDigits: 1 })}% vs. período anterior
    </Badge>
  )
}
