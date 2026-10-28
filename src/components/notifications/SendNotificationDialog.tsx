import { useEffect } from 'react'
import { useAudienceCount, useCreateNotification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CreateNotificationDto } from '@/types/notification'

interface Props {
  payload: CreateNotificationDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSent: () => void
}

export function SendNotificationDialog({ payload, open, onOpenChange, onSent }: Props) {
  const audienceCount = useAudienceCount()
  const createNotification = useCreateNotification()

  useEffect(() => {
    if (open && payload) {
      audienceCount.mutate({
        audience: payload.audience,
        channels: payload.channels,
        type: payload.type,
      })
    }
    if (!open) {
      audienceCount.reset()
      createNotification.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onConfirm = async () => {
    if (!payload) return
    try {
      await createNotification.mutateAsync(payload)
      onOpenChange(false)
      onSent()
    } catch {
      // el toast de error ya lo muestra useCreateNotification
    }
  }

  const scheduledLabel = payload?.scheduledAt
    ? new Date(payload.scheduledAt).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'ahora (dentro del próximo minuto)'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar envío</DialogTitle>
          <DialogDescription>
            Se va a enviar <strong>{scheduledLabel}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border p-4 text-sm">
          {audienceCount.isPending ? (
            <p className="text-muted-foreground">Calculando audiencia...</p>
          ) : audienceCount.isError ? (
            <p className="text-destructive">No se pudo calcular a cuántos usuarios llega.</p>
          ) : audienceCount.data ? (
            <div className="space-y-1">
              <p>
                Va a llegar a <strong>{audienceCount.data.total}</strong> usuario
                {audienceCount.data.total === 1 ? '' : 's'}.
              </p>
              <p className="text-muted-foreground">
                Móvil: {audienceCount.data.mobile} · Web: {audienceCount.data.web}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createNotification.isPending}
          >
            Volver
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={
              createNotification.isPending ||
              audienceCount.isPending ||
              (audienceCount.data?.total ?? 0) === 0
            }
          >
            {createNotification.isPending ? 'Enviando...' : 'Confirmar envío'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
