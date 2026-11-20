import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardGrowth } from '@/hooks/useDashboard'
import { Section } from './SectionState'
import { StatCard } from './StatCard'
import { DeltaBadge } from './DeltaBadge'
import { formatNumber, formatPercent } from '@/lib/format'
import { ONBOARDING_STEP_LABELS, formatShortDate } from '@/lib/dashboardLabels'
import type { DashboardFilters } from '@/types/dashboard'

export function GrowthSection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardGrowth(filters)

  const totalSignups = data?.signupsByDay.reduce((sum, d) => sum + d.count, 0) ?? 0
  const maxReached = data?.onboardingFunnel[0]?.reached ?? 0
  const preregConversionPct =
    data && data.preregistration.total > 0
      ? (data.preregistration.redeemed / data.preregistration.total) * 100
      : 0

  return (
    <Section
      title="Crecimiento y registro"
      description="Altas por día y embudo de onboarding"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isFetching={isFetching}
    >
      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <StatCard
              label="Altas en el período"
              value={formatNumber(totalSignups)}
              className="w-fit min-w-[160px]"
            />
            {data.previous && (
              <DeltaBadge current={totalSignups} previous={data.previous.signups} />
            )}
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.signupsByDay}>
                <defs>
                  <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(v) => formatShortDate(String(v))}
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Altas"
                  stroke="var(--chart-1)"
                  fill="url(#signupsFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Embudo de onboarding</h3>
            <div className="space-y-2">
              {data.onboardingFunnel.map((step) => {
                const widthPct = maxReached > 0 ? (step.reached / maxReached) * 100 : 0
                return (
                  <div key={step.step} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-sm">
                      {ONBOARDING_STEP_LABELS[step.step] ?? step.step}
                    </span>
                    <div className="flex-1 rounded-full bg-muted">
                      <div
                        className="flex h-6 items-center justify-end rounded-full bg-chart-1 px-2 text-xs font-medium text-primary-foreground"
                        style={{ width: `${Math.max(widthPct, 8)}%` }}
                      >
                        {formatNumber(step.reached)}
                      </div>
                    </div>
                    <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
                      {formatNumber(step.count)} parados acá
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Preregistros" value={formatNumber(data.preregistration.total)} />
            <StatCard label="Canjeados" value={formatNumber(data.preregistration.redeemed)} />
            <StatCard label="Conversión" value={formatPercent(preregConversionPct)} />
          </div>
        </div>
      )}
    </Section>
  )
}
