import { useEffect, useState } from 'react'
import { useRevokePremium } from '@/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const REASON_MAX = 500

interface Props {
  userId: string
  userName?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RevokePremiumDialog({ userId, userName, open, onOpenChange }: Props) {
  const [reason, setReason] = useState('')
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const mutation = useRevokePremium()

  useEffect(() => {
    if (!open) {
      setReason('')
      setStep('form')
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const displayName = userName?.trim() || 'este usuario'

  const onConfirm = async () => {
    try {
      await mutation.mutateAsync({ id: userId, data: { reason: reason.trim() || undefined } })
      onOpenChange(false)
    } catch {
      // mutation.error ya muestra el toast desde useRevokePremium
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Pausar o cancelar premium manual</DialogTitle>
              <DialogDescription>
                Esto corta el premium manual de {displayName} ahora mismo. Para que vuelva a
                tenerlo hay que otorgárselo de nuevo con una nueva fecha.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="revokeReason">Motivo (opcional)</Label>
              <Textarea
                id="revokeReason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
                maxLength={REASON_MAX}
                placeholder="Ej: error al otorgarlo, pedido del usuario..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {reason.length}/{REASON_MAX}
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={() => setStep('confirm')}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>¿Cancelar el premium manual?</DialogTitle>
              <DialogDescription>
                {displayName} va a dejar de tener premium manual ahora mismo
                {reason.trim() ? ` · Motivo: "${reason.trim()}"` : ''}. Esta acción no se puede
                deshacer.
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
                {mutation.isPending ? 'Cancelando...' : 'Sí, cancelar'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
