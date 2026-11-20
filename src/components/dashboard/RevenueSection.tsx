import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDashboardRevenue } from '@/hooks/useDashboard'
import { Section } from './SectionState'
import { StatCard } from './StatCard'
import { DeltaBadge } from './DeltaBadge'
import { formatNumber, formatPercent, formatCurrencyMicros } from '@/lib/format'
import { formatShortDate } from '@/lib/dashboardLabels'
import type { DashboardFilters } from '@/types/dashboard'

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
}

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function RevenueSection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardRevenue(filters)

  const currencies = data ? [...new Set(data.revenueByDay.map((r) => r.currency))] : []
  const byDate = new Map<string, Record<string, number | string>>()
  data?.revenueByDay.forEach((row) => {
    const entry = byDate.get(row.date) ?? { date: row.date }
    entry[row.currency] = row.amountMicros / 1_000_000
    byDate.set(row.date, entry)
  })
  const chartData = Array.from(byDate.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  )

  const byPlan = [...(data?.byPlan ?? [])].sort((a, b) => b.count - a.count)
  const byProvider = [...(data?.byProvider ?? [])].sort((a, b) => b.count - a.count)

  return (
    <Section
      title="Monetización"
      description="Ingresos nunca se suman entre monedas distintas"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isFetching={isFetching}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Premium activos" value={formatNumber(data.premium.active)} />
            <div className="flex flex-col gap-1">
              <StatCard label="Nuevos en el período" value={formatNumber(data.premium.new)} />
              {data.previous && <DeltaBadge current={data.premium.new} previous={data.previous.newPremium} />}
            </div>
            <StatCard label="Vencen en 7 días" value={formatNumber(data.premium.expiring7d)} />
            <StatCard label="Conversión" value={formatPercent(data.premium.conversionPct)} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.totals.map((t) => (
              <StatCard key={t.currency} label={`Ingresos (${t.currency})`} value={formatCurrencyMicros(t.amountMicros, t.currency)} />
            ))}
            <StatCard label="Trials activos" value={formatNumber(data.trials)} />
            <StatCard
              label="Auto-renovación apagada"
              value={formatNumber(data.canceledAutoRenewOff)}
              hint="Churn inminente"
            />
          </div>

          {chartData.length > 0 && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip labelFormatter={(v) => formatShortDate(String(v))} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {currencies.map((currency, i) => (
                    <Bar
                      key={currency}
                      dataKey={currency}
                      name={currency}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Por plan</h3>
              <ResponsiveContainer width="100%" height={Math.max(byPlan.length * 36, 80)}>
                <BarChart data={byPlan} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="plan" stroke="var(--muted-foreground)" fontSize={12} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Suscripciones" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Por proveedor</h3>
              <ResponsiveContainer width="100%" height={Math.max(byProvider.length * 36, 80)}>
                <BarChart data={byProvider} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="provider" stroke="var(--muted-foreground)" fontSize={12} width={110} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Suscripciones" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
