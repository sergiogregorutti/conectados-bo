import { createFileRoute, Link } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { ArrowLeft, ShieldOff, ShieldCheck, ExternalLink } from 'lucide-react'
import { useReportedUserDetail } from '@/hooks/useReports'
import { UserStatusDialog } from '@/components/users/UserStatusDialog'
import { DiscardReportDialog } from '@/components/reports/DiscardReportDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { REASON_LABELS } from '@/types/report'
import type { Report } from '@/types/report'

export const Route = createFileRoute('/dashboard/reports/$userId')({
  component: ReportedUserDetailPage,
})

function ReportedUserDetailPage() {
  const { userId } = Route.useParams()
  const { data, isLoading, error } = useReportedUserDetail(userId)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [discardReportId, setDiscardReportId] = useState<string | null>(null)

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
          {notFound ? 'Usuario no encontrado' : 'Error al cargar el caso'}
        </p>
        <Button asChild variant="outline">
          <Link to="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Reportados
          </Link>
        </Button>
      </div>
    )
  }

  if (!data) return null

  const { user, reports } = data
  const initials = (user.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const statusAction = user.disabled ? 'enable' : 'disable'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Reportados
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 pt-6">
          <Avatar size="lg" className="size-16">
            {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name ?? ''} /> : null}
            <AvatarFallback className="text-lg">{initials || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{user.name ?? 'Sin nombre'}</h1>
              {user.disabled ? (
                <Badge variant="destructive" className="gap-1">
                  <ShieldOff className="h-3 w-3" />
                  Deshabilitado
                </Badge>
              ) : (
                <Badge variant="outline">Activo</Badge>
              )}
            </div>
            <p className="font-mono text-sm text-muted-foreground break-all">{user.id}</p>
            <p className="text-sm text-muted-foreground">{user.email ?? 'Sin email'}</p>
          </div>
          <Separator orientation="vertical" className="hidden h-16 md:block" />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/users/$userId" params={{ userId: user.id }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver perfil completo
              </Link>
            </Button>
            <Button
              variant={user.disabled ? 'default' : 'destructive'}
              size="sm"
              onClick={() => setStatusDialogOpen(true)}
            >
              {user.disabled ? (
                <ShieldCheck className="mr-2 h-4 w-4" />
              ) : (
                <ShieldOff className="mr-2 h-4 w-4" />
              )}
              {user.disabled ? 'Habilitar' : 'Deshabilitar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reportes ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin reportes</p>
          ) : (
            <ul className="space-y-4">
              {reports.map((report) => (
                <ReportItem
                  key={report.id}
                  report={report}
                  onDiscard={() => setDiscardReportId(report.id)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <UserStatusDialog
        userId={user.id}
        userName={user.name}
        action={statusAction}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
      <DiscardReportDialog
        reportId={discardReportId}
        open={!!discardReportId}
        onOpenChange={(open) => !open && setDiscardReportId(null)}
      />
    </div>
  )
}

function ReportItem({ report, onDiscard }: { report: Report; onDiscard: () => void }) {
  return (
    <li className="rounded-md border p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{REASON_LABELS[report.reason] ?? report.reason}</Badge>
          <ResolutionBadge resolution={report.resolution} />
          {report.comment && <Badge variant="outline">Desde un comentario del debate</Badge>}
        </div>
        {report.resolution === 'PENDING' && (
          <Button size="sm" variant="outline" onClick={onDiscard}>
            Descartar
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{formatDateTime(report.createdAt)}</p>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Reportado por:</span>
        <span className="font-medium">{report.reporter.name ?? 'Sin nombre'}</span>
        <span className="font-mono text-xs text-muted-foreground">{report.reporter.id}</span>
      </div>

      {report.details && <p className="text-sm">{report.details}</p>}

      {report.comment && (
        <div className="rounded-md border bg-muted/30 p-2 text-sm">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Comentario reportado ({report.comment.status})
          </p>
          <p>{report.comment.text}</p>
        </div>
      )}

      {report.resolution !== 'PENDING' && (
        <div className="border-t pt-2 text-xs text-muted-foreground">
          <p>Resuelto el {formatDateTime(report.resolvedAt)}</p>
          {report.resolutionNote && <p>Nota: {report.resolutionNote}</p>}
        </div>
      )}
    </li>
  )
}

function ResolutionBadge({ resolution }: { resolution: string }) {
  if (resolution === 'PENDING') return <Badge>Pendiente</Badge>
  if (resolution === 'DISMISSED') return <Badge variant="secondary">Descartado</Badge>
  if (resolution === 'ACTIONED') {
    return <Badge variant="outline">Accionado (se eliminó el comentario)</Badge>
  }
  return <Badge variant="outline">{resolution}</Badge>
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
