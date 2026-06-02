import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { useSetUserStatus } from '@/hooks/useUsers'
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
  action: 'enable' | 'disable'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserStatusDialog({
  userId,
  userName,
  action,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [reason, setReason] = useState('')
  const mutation = useSetUserStatus()

  useEffect(() => {
    if (!open) {
      setReason('')
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isDisable = action === 'disable'

  const onConfirm = async () => {
    try {
      await mutation.mutateAsync({
        id: userId,
        action,
        reason: isDisable ? reason.trim() || undefined : undefined,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // mutation.error is set
    }
  }

  const displayName = userName?.trim() || 'este usuario'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isDisable ? 'Deshabilitar usuario' : 'Habilitar usuario'}
          </DialogTitle>
          <DialogDescription>
            {isDisable
              ? `${displayName} no podrá usar la aplicación hasta que vuelvas a habilitarlo.`
              : `${displayName} podrá volver a usar la aplicación.`}
          </DialogDescription>
        </DialogHeader>

        {isDisable && (
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
              maxLength={REASON_MAX}
              placeholder="Ej. comportamiento abusivo reportado por múltiples usuarios"
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reason.length}/{REASON_MAX}
            </p>
          </div>
        )}

        {mutation.error && (
          <p className="text-sm text-destructive">{getErrorMessage(mutation.error)}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant={isDisable ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? isDisable
                ? 'Deshabilitando...'
                : 'Habilitando...'
              : isDisable
                ? 'Deshabilitar'
                : 'Habilitar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (status === 401) return 'No autenticado.'
    if (status === 403) return 'No tenés permisos de admin para ejecutar esta acción.'
    if (status === 404) return 'Usuario no encontrado.'
    if (status === 409) return 'El usuario ya está en ese estado.'
    if (status === 400) return 'Solicitud inválida.'
  }
  return 'Ocurrió un error inesperado.'
}
