import { useState } from 'react'
import { useTestNotification } from '@/hooks/useNotifications'
import { toIsoDate } from '@/lib/date'
import { AudienceFilters } from '@/components/notifications/AudienceFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CreatableNotificationType,
  CreateNotificationDto,
  NotificationAudience,
  NotificationChannel,
} from '@/types/notification'

const TITLE_MAX = 65
const BODY_MAX = 178

interface Props {
  onReview: (payload: CreateNotificationDto) => void
}

export function NotificationForm({ onReview }: Props) {
  const [type, setType] = useState<CreatableNotificationType>('ANNOUNCEMENT')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [channels, setChannels] = useState<NotificationChannel[]>(['MOBILE', 'WEB'])
  const [audience, setAudience] = useState<NotificationAudience>({})
  const [schedule, setSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [formError, setFormError] = useState<string | null>(null)

  const testMutation = useTestNotification()

  const toggleChannel = (channel: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    )
  }

  const getScheduledAtIso = (): string | undefined => {
    if (!schedule || !scheduleDate) return undefined
    const date = new Date(`${scheduleDate}T${scheduleTime || '00:00'}:00`)
    return date.toISOString()
  }

  const validate = (): string | null => {
    if (!title.trim()) return 'El título es requerido'
    if (title.length > TITLE_MAX) return `El título supera los ${TITLE_MAX} caracteres`
    if (!body.trim()) return 'El cuerpo es requerido'
    if (body.length > BODY_MAX) return `El cuerpo supera los ${BODY_MAX} caracteres`
    if (channels.length === 0) return 'Elegí al menos un canal de envío'
    if (schedule && !scheduleDate) return 'Elegí una fecha de envío'
    if (schedule) {
      const scheduledAt = getScheduledAtIso()
      if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
        return 'La fecha programada debe ser futura'
      }
    }
    return null
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      setFormError(error)
      return
    }
    setFormError(null)
    onReview({
      type,
      title: title.trim(),
      body: body.trim(),
      audience,
      channels,
      scheduledAt: getScheduledAtIso(),
    })
  }

  const onTest = () => {
    if (!title.trim() || !body.trim()) {
      setFormError('Completá título y cuerpo antes de probar')
      return
    }
    if (channels.length === 0) {
      setFormError('Elegí al menos un canal para probar')
      return
    }
    setFormError(null)
    testMutation.mutate({ title: title.trim(), body: body.trim(), channels })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as CreatableNotificationType)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANNOUNCEMENT">Novedad / mensaje</SelectItem>
            <SelectItem value="REMINDER">Recordatorio</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {type === 'ANNOUNCEMENT'
            ? 'Respeta la preferencia "Novedades" del usuario.'
            : 'Respeta la preferencia "Recordatorios" del usuario.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          maxLength={TITLE_MAX}
          placeholder="Ej: ¡Hay novedades en Conectados!"
        />
        <p className="text-xs text-muted-foreground text-right">
          {title.length}/{TITLE_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Cuerpo</Label>
        <Textarea
          id="body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
          maxLength={BODY_MAX}
          placeholder="Texto del mensaje..."
        />
        <p className="text-xs text-muted-foreground text-right">
          {body.length}/{BODY_MAX}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Canales de envío</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={channels.includes('MOBILE')}
              onCheckedChange={() => toggleChannel('MOBILE')}
            />
            Móvil (push)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={channels.includes('WEB')}
              onCheckedChange={() => toggleChannel('WEB')}
            />
            Web
          </label>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <Label>Audiencia</Label>
        <AudienceFilters value={audience} onChange={setAudience} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={schedule} onCheckedChange={(v) => setSchedule(v === true)} />
          Programar para más adelante
        </label>
        {schedule && (
          <div className="flex gap-2 pt-1">
            <DatePicker
              value={scheduleDate}
              onChange={setScheduleDate}
              min={toIsoDate(new Date())}
              className="flex-1"
            />
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-28"
            />
          </div>
        )}
        {!schedule && (
          <p className="text-sm text-muted-foreground">
            Sin programar, sale dentro del próximo minuto.
          </p>
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex flex-wrap gap-4">
        <Button type="submit">Revisar y enviar</Button>
        <Button type="button" variant="outline" onClick={onTest} disabled={testMutation.isPending}>
          {testMutation.isPending ? 'Probando...' : 'Probar en mi dispositivo'}
        </Button>
      </div>
    </form>
  )
}
