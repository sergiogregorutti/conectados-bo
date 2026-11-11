import { useEffect, useState } from 'react'
import { useDiscardReport } from '@/hooks/useReports'
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

const NOTE_MAX = 500

interface Props {
  reportId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DiscardReportDialog({ reportId, open, onOpenChange }: Props) {
  const [note, setNote] = useState('')
  const mutation = useDiscardReport()

  useEffect(() => {
    if (!open) {
      setNote('')
      mutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onConfirm = async () => {
    if (!reportId) return
    try {
      await mutation.mutateAsync({ reportId, data: { note: note.trim() || undefined } })
      onOpenChange(false)
    } catch {
      // mutation.error ya muestra el toast desde useDiscardReport
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Descartar reporte</DialogTitle>
          <DialogDescription>
            El reporte queda marcado como descartado (no se borra) y deja de contar para el
            límite que oculta el perfil del usuario en la app. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="discardNote">Motivo (opcional)</Label>
          <Textarea
            id="discardNote"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
            maxLength={NOTE_MAX}
            placeholder="Ej: no se encontró infracción, reporte sin fundamento..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {note.length}/{NOTE_MAX}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? 'Descartando...' : 'Descartar reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
