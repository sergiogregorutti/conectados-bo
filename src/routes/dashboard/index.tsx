import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { SummarySection } from '@/components/dashboard/SummarySection'
import { GrowthSection } from '@/components/dashboard/GrowthSection'
import { DemographicsSection } from '@/components/dashboard/DemographicsSection'
import { EngagementSection } from '@/components/dashboard/EngagementSection'
import { RevenueSection } from '@/components/dashboard/RevenueSection'
import type { DashboardFilters as Filters } from '@/types/dashboard'

// Filtros compartidos en la URL (mismo patrón que /dashboard/reports): así se
// puede compartir un link con un rango/provincia ya aplicados y "atrás" no
// los pierde. Sin default: si no están en la URL, cada endpoint aplica el
// suyo (últimos 30 días) y los componentes de filtro muestran ese default
// sólo visualmente.
const dashboardSearchSchema = z.object({
  from: z.string().optional().catch(undefined),
  to: z.string().optional().catch(undefined),
  province: z.string().optional().catch(undefined),
  compare: z.coerce.boolean().default(false).catch(false),
})

export const Route = createFileRoute('/dashboard/')({
  validateSearch: dashboardSearchSchema,
  component: DashboardIndex,
})

function DashboardIndex() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const filters: Filters = {
    from: search.from,
    to: search.to,
    province: search.province,
    compare: search.compare,
  }

  const setFilters = (next: Filters) => {
    navigate({ search: { ...next, compare: next.compare ?? false }, replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Resumen de la actividad de Conectados. Cada sección carga de forma independiente.
        </p>
      </div>

      <DashboardFilters value={filters} onChange={setFilters} />

      <SummarySection filters={filters} />
      <GrowthSection filters={filters} />
      <DemographicsSection filters={filters} />
      <EngagementSection filters={filters} />
      <RevenueSection filters={filters} />
    </div>
  )
}
