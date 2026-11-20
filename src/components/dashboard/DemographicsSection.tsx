import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardDemographics } from '@/hooks/useDashboard'
import { Section } from './SectionState'
import { StatCard } from './StatCard'
import { formatNumber, formatPercent } from '@/lib/format'
import { GENDER_LABELS } from '@/lib/dashboardLabels'
import type { DashboardFilters } from '@/types/dashboard'

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
}

export function DemographicsSection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardDemographics(filters)

  const byProvince = [...(data?.byProvince ?? [])]
    .map((p) => ({ label: p.province ?? 'Sin datos', count: p.count }))
    .sort((a, b) => b.count - a.count)

  const byGender = (data?.byGender ?? [])
    .map((g) => ({ label: g.gender ? GENDER_LABELS[g.gender] ?? g.gender : 'Sin datos', count: g.count }))
    .sort((a, b) => b.count - a.count)

  const byAgeRange = data?.byAgeRange ?? []

  return (
    <Section
      title="Demografía"
      description={data ? `${formatNumber(data.total)} usuarios` : 'Foto actual de la base de usuarios'}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isFetching={isFetching}
    >
      {data && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Por provincia</h3>
              <div className="max-h-80 overflow-y-auto pr-2">
                <ResponsiveContainer width="100%" height={Math.max(byProvince.length * 28, 120)}>
                  <BarChart data={byProvince} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      width={110}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Usuarios" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Por género</h3>
              <ResponsiveContainer width="100%" height={Math.max(byGender.length * 36, 120)}>
                <BarChart data={byGender} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    width={110}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Usuarios" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <h3 className="mt-6 mb-3 text-sm font-medium text-muted-foreground">Por rango de edad</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byAgeRange}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Usuarios" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Perfiles incompletos</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Sin foto"
                value={formatNumber(data.incompleteProfiles.noPhoto)}
                hint={data.total > 0 ? formatPercent((data.incompleteProfiles.noPhoto / data.total) * 100) : undefined}
              />
              <StatCard
                label="Sin bio"
                value={formatNumber(data.incompleteProfiles.noBio)}
                hint={data.total > 0 ? formatPercent((data.incompleteProfiles.noBio / data.total) * 100) : undefined}
              />
              <StatCard
                label="Sin ubicación"
                value={formatNumber(data.incompleteProfiles.noLocation)}
                hint={data.total > 0 ? formatPercent((data.incompleteProfiles.noLocation / data.total) * 100) : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
