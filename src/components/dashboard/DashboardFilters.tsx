import { X } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDashboardProvinceOptions } from '@/hooks/useDashboard'
import { toIsoDate } from '@/lib/date'
import type { DashboardFilters as Filters } from '@/types/dashboard'

const ALL_PROVINCES = '__all__'

function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from: toIsoDate(from), to: toIsoDate(to) }
}

interface Props {
  value: Filters
  onChange: (value: Filters) => void
}

export function DashboardFilters({ value, onChange }: Props) {
  const { provinces } = useDashboardProvinceOptions()
  const defaults = defaultRange()
  const hasCustomFilters = !!(value.from || value.to || value.province || value.compare)

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
      <div className="space-y-1.5">
        <Label>Desde</Label>
        <DatePicker
          value={value.from ?? defaults.from}
          onChange={(from) => onChange({ ...value, from })}
          max={value.to ?? defaults.to}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Hasta</Label>
        <DatePicker
          value={value.to ?? defaults.to}
          onChange={(to) => onChange({ ...value, to })}
          min={value.from ?? defaults.from}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Provincia</Label>
        <Select
          value={value.province ?? ALL_PROVINCES}
          onValueChange={(v) => onChange({ ...value, province: v === ALL_PROVINCES ? undefined : v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PROVINCES}>Todas las provincias</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm">
        <Checkbox
          checked={!!value.compare}
          onCheckedChange={(checked) => onChange({ ...value, compare: checked === true })}
        />
        Comparar con período anterior
      </label>

      {hasCustomFilters && (
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => onChange({})}>
          <X className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
