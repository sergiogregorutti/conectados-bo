import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useDashboardEngagement } from '@/hooks/useDashboard'
import { Section } from './SectionState'
import { StatCard } from './StatCard'
import { DeltaBadge } from './DeltaBadge'
import { formatNumber, formatPercent } from '@/lib/format'
import { DOW_LABELS, formatShortDate } from '@/lib/dashboardLabels'
import type { DashboardFilters, PeakHour } from '@/types/dashboard'

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
}

const FUNNEL_STEPS: { key: keyof EngagementFunnel; label: string }[] = [
  { key: 'swipes', label: 'Swipes' },
  { key: 'likes', label: 'Likes' },
  { key: 'matches', label: 'Matches' },
  { key: 'conversations', label: 'Con mensajes' },
  { key: 'replied', label: 'Respondidos' },
]

type EngagementFunnel = {
  swipes: number
  likes: number
  matches: number
  conversations: number
  replied: number
}

export function EngagementSection({ filters }: { filters: DashboardFilters }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardEngagement(filters)

  const totalMessages = data?.byDay.reduce((sum, d) => sum + d.messages, 0) ?? 0
  const totalMatches = data?.byDay.reduce((sum, d) => sum + d.matches, 0) ?? 0
  const maxFunnel = data?.funnel.swipes ?? 0

  return (
    <Section
      title="Engagement y actividad"
      description="Swipes, matches, mensajes y horas pico"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isFetching={isFetching}
    >
      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatCard label="Matches en el período" value={formatNumber(totalMatches)} className="w-fit min-w-[160px]" />
            {data.previous && <DeltaBadge current={totalMatches} previous={data.previous.matches} />}
            <StatCard label="Mensajes en el período" value={formatNumber(totalMessages)} className="w-fit min-w-[160px]" />
            {data.previous && <DeltaBadge current={totalMessages} previous={data.previous.messages} />}
            <StatCard
              label="Matches muertos"
              value={formatNumber(data.deadMatches)}
              hint="Sin ningún mensaje"
              className="w-fit min-w-[160px]"
            />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => formatShortDate(String(v))} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="swipes" name="Swipes" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="likes" name="Likes" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="matches" name="Matches" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="messages" name="Mensajes" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Embudo de matching</h3>
            <div className="space-y-2">
              {FUNNEL_STEPS.map(({ key, label }) => {
                const value = data.funnel[key]
                const widthPct = maxFunnel > 0 ? (value / maxFunnel) * 100 : 0
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-sm">{label}</span>
                    <div className="flex-1 rounded-full bg-muted">
                      <div
                        className="flex h-6 items-center justify-end rounded-full bg-chart-1 px-2 text-xs font-medium text-primary-foreground"
                        style={{ width: `${Math.max(widthPct, 8)}%` }}
                      >
                        {formatNumber(value)}
                      </div>
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                      {maxFunnel > 0 ? formatPercent((value / maxFunnel) * 100) : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Horas pico (hora Argentina)</h3>
            <PeakHoursHeatmap peakHours={data.peakHours} />
          </div>
        </div>
      )}
    </Section>
  )
}

function PeakHoursHeatmap({ peakHours }: { peakHours: PeakHour[] }) {
  const max = Math.max(1, ...peakHours.map((p) => p.count))
  const grid = new Map<string, number>()
  peakHours.forEach((p) => grid.set(`${p.dow}-${p.hour}`, p.count))

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid min-w-[700px] grid-cols-[32px_repeat(24,1fr)] gap-1">
        <div />
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="text-center text-[10px] text-muted-foreground">
            {hour % 3 === 0 ? hour : ''}
          </div>
        ))}
        {DOW_LABELS.map((dowLabel, dow) => (
          <div key={dow} className="contents">
            <div className="flex items-center text-[10px] text-muted-foreground">{dowLabel}</div>
            {Array.from({ length: 24 }).map((_, hour) => {
              const count = grid.get(`${dow}-${hour}`) ?? 0
              const intensity = count / max
              return (
                <div
                  key={hour}
                  title={`${dowLabel} ${hour}:00 — ${formatNumber(count)}`}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor:
                      intensity === 0 ? 'var(--muted)' : `color-mix(in oklch, var(--chart-1) ${Math.round(intensity * 100)}%, var(--muted))`,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
