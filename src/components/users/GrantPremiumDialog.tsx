import { useEffect, useState } from 'react'
import { useGrantPremium } from '@/hooks/useUsers'
import { addMonths, endOfDayIso, parseLocalDate, toIsoDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const NOTE_MAX = 500
type Preset = '1m' | '2m' | 'custom'

interface Props {
  userId: string
  userName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GrantPremiumDialog({ userId, userName, open, onOpenChange }: Props) {
  const [preset, setPreset] = useState<Preset>('1m')
  const [customDate, setCustomDate] = useState('')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const mutation = useGrantPremium()

  useEffect(() => {
    if (!open) {
      setPreset('1m')
      setCustomDate('')
      setNote('')
      setStep('form')
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const expiresAtDate =
    preset === '1m'
      ? addMonths(new Date(), 1)
      : preset === '2m'
        ? addMonths(new Date(), 2)
        : (parseLocalDate(customDate) ?? null)

  const displayName = userName?.trim() || 'este usuario'
  const canContinue = preset !== 'custom' || !!customDate

  const onConfirm = async () => {
    if (!expiresAtDate) return
    try {
      await mutation.mutateAsync({
        id: userId,
        data: { expiresAt: endOfDayIso(expiresAtDate), note: note.trim() || undefined },
      })
      onOpenChange(false)
    } catch {
      // mutation.error ya muestra el toast desde useGrantPremium
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Otorgar premium manual</DialogTitle>
              <DialogDescription>
                Definí hasta cuándo {displayName} tiene premium. Si ya tenía uno manual activo, la
                nueva fecha lo reemplaza.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Duración</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === '1m' ? 'default' : 'outline'}
                    onClick={() => setPreset('1m')}
                  >
                    1 mes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === '2m' ? 'default' : 'outline'}
                    onClick={() => setPreset('2m')}
                  >
                    2 meses
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === 'custom' ? 'default' : 'outline'}
                    onClick={() => setPreset('custom')}
                  >
                    Elegir fecha
                  </Button>
                </div>
              </div>

              {preset === 'custom' ? (
                <div className="space-y-2">
                  <Label htmlFor="customDate">Fecha de vencimiento</Label>
                  <DatePicker
                    id="customDate"
                    value={customDate}
                    onChange={setCustomDate}
                    min={toIsoDate(new Date())}
                  />
                </div>
              ) : (
                expiresAtDate && (
                  <p className="text-sm text-muted-foreground">
                    Vence el{' '}
                    <strong>
                      {expiresAtDate.toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </strong>
                  </p>
                )
              )}

              <div className="space-y-2">
                <Label htmlFor="note">Motivo (opcional)</Label>
                <Textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                  maxLength={NOTE_MAX}
                  placeholder="Ej: promo de lanzamiento, primeros 100 usuarios..."
                />
                <p className="text-xs text-muted-foreground text-right">
                  {note.length}/{NOTE_MAX}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => setStep('confirm')} disabled={!canContinue}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar premium manual</DialogTitle>
              <DialogDescription>
                {displayName} va a tener premium hasta el{' '}
                <strong>
                  {expiresAtDate?.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </strong>
                {note.trim() ? ` · Motivo: "${note.trim()}"` : ''}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                disabled={mutation.isPending}
              >
                Volver
              </Button>
              <Button type="button" onClick={onConfirm} disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
