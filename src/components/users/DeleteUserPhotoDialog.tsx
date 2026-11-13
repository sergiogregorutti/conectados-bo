import { useEffect, useState } from 'react'
import { useDeleteUserPhoto } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const REASON_MAX = 500
const OTHER_VALUE = 'OTHER'

// La API solo espera un string libre en `reason`, así que estas opciones son
// una conveniencia del front (evitan tipear para los motivos frecuentes) —
// el valor final enviado es la etiqueta elegida, o el texto libre si es "Otro".
const REASON_PRESETS = [
  'Contenido sexual explícito',
  'Violencia o contenido gráfico',
  'Foto borrosa o irreconocible',
  'No es una foto de perfil real (objeto, pantalla, captura)',
  'Posible menor de edad',
  'Información de contacto visible (teléfono, redes, etc.)',
]

interface Props {
  userId: string
  userName?: string | null
  photoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteUserPhotoDialog({ userId, userName, photoId, open, onOpenChange }: Props) {
  const [preset, setPreset] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useDeleteUserPhoto()

  useEffect(() => {
    if (!open) {
      setPreset('')
      setCustomReason('')
      setStep('form')
      setFormError(null)
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const displayName = userName?.trim() || 'este usuario'
  const isOther = preset === OTHER_VALUE
  const finalReason = isOther ? customReason.trim() : preset

  const onContinue = () => {
    if (!preset) {
      setFormError('Elegí un motivo')
      return
    }
    if (isOther && !customReason.trim()) {
      setFormError('Escribí el motivo')
      return
    }
    setFormError(null)
    setStep('confirm')
  }

  const onConfirm = async () => {
    if (!photoId || !finalReason) return
    try {
      await mutation.mutateAsync({ id: userId, photoId, data: { reason: finalReason } })
      onOpenChange(false)
    } catch {
      // mutation.error ya muestra el toast desde useDeleteUserPhoto
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Eliminar foto</DialogTitle>
              <DialogDescription>
                La foto se borra del almacenamiento de forma permanente. Esta acción no se puede
                deshacer y queda registrada en el historial de moderación de {displayName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Motivo (obligatorio)</Label>
                <Select
                  value={preset}
                  onValueChange={(v) => {
                    setPreset(v)
                    if (formError) setFormError(null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí un motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_PRESETS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_VALUE}>Otro...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isOther && (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value.slice(0, REASON_MAX))
                      if (formError) setFormError(null)
                    }}
                    maxLength={REASON_MAX}
                    placeholder="Describí el motivo..."
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customReason.length}/{REASON_MAX}
                  </p>
                </div>
              )}

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={onContinue}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>¿Eliminar esta foto?</DialogTitle>
              <DialogDescription>
                Se va a borrar de forma permanente · Motivo: "{finalReason}". Esta acción no se
                puede deshacer.
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
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
