import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: string
  tooltip?: string
  className?: string
}

export function StatCard({ label, value, hint, tooltip, className }: StatCardProps) {
  return (
    <Card className={cn('gap-2 py-4', className)}>
      <CardHeader className="px-4">
        <CardDescription className="flex items-center gap-1">
          {label}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
