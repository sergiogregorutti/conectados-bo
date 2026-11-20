import { Link } from '@tanstack/react-router'
import { useDashboardSummary } from '@/hooks/useDashboard'
import { Section } from './SectionState'
import { StatCard } from './StatCard'
import { formatNumber } from '@/lib/format'
import type { DashboardFilters } from '@/types/dashboard'

const APPROX_HINT = 'Aproximado: sólo se guarda la última conexión, no sesiones.'

export function SummarySection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardSummary(filters)

  return (
    <Section
      title="Resumen"
      description={
        data ? `Actualizado ${new Date(data.generatedAt).toLocaleTimeString('es-AR')}` : undefined
      }
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isFetching={isFetching}
    >
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Registrados hoy" value={formatNumber(data.registered.today)} />
            <StatCard label="Registrados ayer" value={formatNumber(data.registered.yesterday)} />
            <StatCard label="Últimos 7 días" value={formatNumber(data.registered.last7d)} />
            <StatCard label="Últimos 30 días" value={formatNumber(data.registered.last30d)} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Activos ahora"
              value={formatNumber(data.activeNow)}
              tooltip="Conectados en los últimos 15 minutos."
            />
            <StatCard label="DAU" value={formatNumber(data.dau)} tooltip={APPROX_HINT} />
            <StatCard label="WAU" value={formatNumber(data.wau)} tooltip={APPROX_HINT} />
            <StatCard label="MAU" value={formatNumber(data.mau)} tooltip={APPROX_HINT} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Swipes hoy" value={formatNumber(data.swipesToday)} />
            <StatCard label="Matches hoy" value={formatNumber(data.matchesToday)} />
            <StatCard label="Mensajes hoy" value={formatNumber(data.messagesToday)} />
            <StatCard
              label="Onboarding completado hoy"
              value={formatNumber(data.onboardingCompletedToday)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link to="/dashboard/reports">
              <StatCard
                label="Reportes pendientes"
                value={formatNumber(data.pendingReports)}
                className="transition-colors hover:border-primary/50"
              />
            </Link>
            <StatCard label="Premium activos" value={formatNumber(data.premiumActive)} />
            <StatCard label="Cuentas deshabilitadas" value={formatNumber(data.disabledAccounts)} />
            <StatCard label="Bajas hoy" value={formatNumber(data.deletedToday)} />
          </div>
        </div>
      )}
    </Section>
  )
}
