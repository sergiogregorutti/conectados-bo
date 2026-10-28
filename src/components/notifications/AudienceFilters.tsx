import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  NotificationAudience,
  NotificationChannel,
  OnboardingAudienceFilter,
  PremiumAudienceFilter,
} from '@/types/notification'

// Valores exactos de los enums de Prisma (conectados-api/prisma/schema.prisma),
// no hay un endpoint que los liste.
const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'MALE', label: 'Hombre' },
  { value: 'FEMALE', label: 'Mujer' },
  { value: 'NON_BINARY', label: 'No binario' },
  { value: 'TRANS_MALE', label: 'Hombre trans' },
  { value: 'TRANS_FEMALE', label: 'Mujer trans' },
]

const ONBOARDING_STEP_OPTIONS: { value: string; label: string }[] = [
  { value: 'BASIC_DETAILS', label: 'Datos básicos' },
  { value: 'PHOTOS', label: 'Fotos' },
  { value: 'LOCATION_PREFERENCES', label: 'Ubicación y preferencias' },
  { value: 'PRIVACY', label: 'Privacidad' },
  { value: 'COMPLETED', label: 'Completado' },
]

const PLATFORM_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: 'MOBILE', label: 'Móvil' },
  { value: 'WEB', label: 'Web' },
]

interface Props {
  value: NotificationAudience
  onChange: (value: NotificationAudience) => void
}

export function AudienceFilters({ value, onChange }: Props) {
  const toggleArrayValue = <K extends 'platform' | 'genderIdentity' | 'onboardingStep'>(
    key: K,
    option: string,
  ) => {
    const current = (value[key] as string[] | undefined) ?? []
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option]
    onChange({ ...value, [key]: next.length > 0 ? next : undefined })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Plan</Label>
        <Select
          value={value.premium ?? 'any'}
          onValueChange={(v) =>
            onChange({ ...value, premium: v === 'any' ? undefined : (v as PremiumAudienceFilter) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Todos</SelectItem>
            <SelectItem value="PREMIUM">Solo premium</SelectItem>
            <SelectItem value="FREE">Solo free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Plataforma del usuario</Label>
        <p className="text-xs text-muted-foreground">
          No confundir con los canales de envío: esto filtra a quién entra, no por dónde se le
          manda.
        </p>
        <div className="flex gap-4">
          {PLATFORM_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={(value.platform ?? []).includes(opt.value)}
                onCheckedChange={() => toggleArrayValue('platform', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Identidad de género</Label>
        <div className="flex flex-wrap gap-4">
          {GENDER_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={(value.genderIdentity ?? []).includes(opt.value)}
                onCheckedChange={() => toggleArrayValue('genderIdentity', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ageMin">Edad mínima</Label>
          <Input
            id="ageMin"
            type="number"
            min={18}
            max={99}
            value={value.ageMin ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                ageMin: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ageMax">Edad máxima</Label>
          <Input
            id="ageMax"
            type="number"
            min={18}
            max={99}
            value={value.ageMax ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                ageMax: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="provinces">Provincias</Label>
        <Input
          id="provinces"
          placeholder="Buenos Aires, Córdoba, Santa Fe..."
          value={(value.provinces ?? []).join(', ')}
          onChange={(e) => {
            const provinces = e.target.value
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
            onChange({ ...value, provinces: provinces.length > 0 ? provinces : undefined })
          }}
        />
        <p className="text-xs text-muted-foreground">Separadas por coma. Vacío = todas.</p>
      </div>

      <div className="space-y-2">
        <Label>Onboarding</Label>
        <Select
          value={value.onboarding ?? 'any'}
          onValueChange={(v) =>
            onChange({
              ...value,
              onboarding: v === 'any' ? undefined : (v as OnboardingAudienceFilter),
              // Si deja de filtrar por "incompleto", el paso de onboarding no aplica.
              onboardingStep: v === 'any' ? undefined : value.onboardingStep,
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Todos</SelectItem>
            <SelectItem value="COMPLETED">Completaron onboarding</SelectItem>
            <SelectItem value="INCOMPLETE">No completaron onboarding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.onboarding === 'INCOMPLETE' && (
        <div className="space-y-2">
          <Label>Paso de onboarding (opcional)</Label>
          <div className="flex flex-wrap gap-4">
            {ONBOARDING_STEP_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={(value.onboardingStep ?? []).includes(opt.value)}
                  onCheckedChange={() => toggleArrayValue('onboardingStep', opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
