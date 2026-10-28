import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, RefreshCw, X } from 'lucide-react'
import { useCancelNotification, useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import type {
  AdminNotification,
  NotificationsFilterStatus,
  NotificationsFilterType,
} from '@/types/notification'

export const Route = createFileRoute('/dashboard/notifications/')({
  component: NotificationsPage,
})

const ITEMS_PER_PAGE = 20

const TYPE_LABELS: Record<string, string> = {
  ANNOUNCEMENT: 'Novedad',
  REMINDER: 'Recordatorio',
  DEBATE_POST: 'Post de debate',
}

function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<NotificationsFilterStatus>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationsFilterType>('all')
  const [cancelId, setCancelId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useNotifications({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter,
    type: typeFilter,
  })

  const cancelMutation = useCancelNotification()

  const notifications = data?.notifications ?? []
  const pagination = data?.pagination

  const handleStatusChange = (v: NotificationsFilterStatus) => {
    setStatusFilter(v)
    setPage(1)
  }

  const handleTypeChange = (v: NotificationsFilterType) => {
    setTypeFilter(v)
    setPage(1)
  }

  const onConfirmCancel = () => {
    if (!cancelId) return
    cancelMutation.mutate(cancelId, { onSuccess: () => setCancelId(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Historial de envíos a los usuarios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/dashboard/notifications/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva notificación
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={(v) => handleStatusChange(v as NotificationsFilterStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="SCHEDULED">Programado</SelectItem>
            <SelectItem value="SENDING">Enviando</SelectItem>
            <SelectItem value="SENT">Enviado</SelectItem>
            <SelectItem value="CANCELED">Cancelado</SelectItem>
            <SelectItem value="FAILED">Falló</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => handleTypeChange(v as NotificationsFilterType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="ANNOUNCEMENT">Novedad</SelectItem>
            <SelectItem value="REMINDER">Recordatorio</SelectItem>
            <SelectItem value="DEBATE_POST">Post de debate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Canales</TableHead>
              <TableHead className="text-right">Destinatarios</TableHead>
              <TableHead className="text-right">Entregados</TableHead>
              <TableHead>Programado</TableHead>
              <TableHead className="w-[60px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay notificaciones para mostrar
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onCancel={() => setCancelId(n.id)} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
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

function NotificationRow({
  notification,
  onCancel,
}: {
  notification: AdminNotification
  onCancel: () => void
}) {
  return (
    <TableRow>
      <TableCell>
        <Link
          to="/dashboard/notifications/$notificationId"
          params={{ notificationId: notification.id }}
          className="font-medium hover:underline"
        >
          {notification.title}
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{TYPE_LABELS[notification.type] ?? notification.type}</Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={notification.status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {notification.channels.join(' · ')}
      </TableCell>
      <TableCell className="text-right font-mono">{notification.recipientsCount}</TableCell>
      <TableCell className="text-right font-mono">{notification.deliveredCount}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(notification.scheduledAt)}
      </TableCell>
      <TableCell className="text-right">
        {notification.status === 'SCHEDULED' && (
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancelar envío">
            <X className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </TableCell>
    </TableRow>
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
