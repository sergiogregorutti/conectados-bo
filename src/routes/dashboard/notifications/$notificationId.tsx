import { createFileRoute, Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useCancelNotification, useNotification } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export const Route = createFileRoute('/dashboard/notifications/$notificationId')({
  component: NotificationDetailPage,
})

const TYPE_LABELS: Record<string, string> = {
  ANNOUNCEMENT: 'Novedad',
  REMINDER: 'Recordatorio',
  DEBATE_POST: 'Post de debate',
}

function NotificationDetailPage() {
  const { notificationId } = Route.useParams()
  const { data, isLoading, error } = useNotification(notificationId)
  const [cancelOpen, setCancelOpen] = useState(false)
  const cancelMutation = useCancelNotification()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (error) {
    const notFound = isAxiosError(error) && error.response?.status === 404
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">
          {notFound ? 'Notificación no encontrada' : 'Error al cargar la notificación'}
        </p>
        <Button asChild variant="outline">
          <Link to="/dashboard/notifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Link>
        </Button>
      </div>
    )
  }

  if (!data) return null

  const onConfirmCancel = () => {
    cancelMutation.mutate(data.id, { onSuccess: () => setCancelOpen(false) })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/notifications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Notificaciones
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{data.title}</CardTitle>
              <StatusBadge status={data.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {TYPE_LABELS[data.type] ?? data.type} · {data.channels.join(' · ')}
            </p>
          </div>
          {data.status === 'SCHEDULED' && (
            <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar envío
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{data.body}</p>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <InfoLine label="Programado" value={formatDateTime(data.scheduledAt)} />
            <InfoLine label="Enviado" value={formatDateTime(data.sentAt)} />
            <InfoLine label="Iniciado" value={formatDateTime(data.startedAt)} />
            <InfoLine label="Creado" value={formatDateTime(data.createdAt)} />
            <InfoLine label="Destinatarios" value={String(data.recipientsCount)} />
            <InfoLine label="Entregados" value={String(data.deliveredCount)} />
            <InfoLine label="Fallidos" value={String(data.failedCount)} />
            <InfoLine label="Admin" value={data.adminId} mono />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Audiencia</p>
            {Object.keys(data.audience).length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos los usuarios elegibles</p>
            ) : (
              <pre className="overflow-x-auto rounded-md border bg-muted/30 p-3 text-xs">
                {JSON.stringify(data.audience, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este envío?</AlertDialogTitle>
            <AlertDialogDescription>
              El envío programado no va a salir. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className={mono ? 'font-mono text-xs break-all' : 'font-medium'}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'SENT') return <Badge>Enviado</Badge>
  if (status === 'SCHEDULED') return <Badge variant="outline">Programado</Badge>
  if (status === 'SENDING') return <Badge variant="outline">Enviando</Badge>
  if (status === 'CANCELED') return <Badge variant="secondary">Cancelado</Badge>
  if (status === 'FAILED') return <Badge variant="destructive">Falló</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function formatDateTime(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
