import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, RefreshCw, Flag, Check, Trash2, X } from 'lucide-react'
import { useApproveComment, useComments, useRemoveComment } from '@/hooks/useDebateComments'
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
import type { CommentStatusFilter, DebateComment, ReportReason } from '@/types/debateComment'

const commentsSearchSchema = z.object({
  postId: z.string().uuid().optional(),
})

export const Route = createFileRoute('/dashboard/debate/comments')({
  component: CommentsPage,
  validateSearch: commentsSearchSchema,
})

const ITEMS_PER_PAGE = 20

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: 'Contenido inapropiado',
  HARASSMENT: 'Acoso',
  FAKE_PROFILE: 'Perfil falso',
  SPAM: 'Spam',
  UNDERAGE: 'Menor de edad',
  OTHER: 'Otro',
}

function CommentsPage() {
  const { postId } = Route.useSearch()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<CommentStatusFilter>('all')
  const [removeTarget, setRemoveTarget] = useState<DebateComment | null>(null)

  const { data, isLoading, refetch, isFetching } = useComments({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter,
    postId,
  })

  const approveMutation = useApproveComment()
  const removeMutation = useRemoveComment()

  const comments = data?.data ?? []
  const pagination = data?.pagination

  const handleStatusChange = (value: CommentStatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }

  const onConfirmRemove = () => {
    if (!removeTarget) return
    removeMutation.mutate(removeTarget.id, { onSuccess: () => setRemoveTarget(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comentarios</h1>
          <p className="text-muted-foreground">
            Moderá los comentarios de los posts de debate
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => handleStatusChange(v as CommentStatusFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="flagged">Flaggeados</SelectItem>
            <SelectItem value="reported">Con denuncias</SelectItem>
          </SelectContent>
        </Select>

        {postId && (
          <Badge variant="secondary" className="gap-1">
            Filtrado por post
            <Link
              to="/dashboard/debate/comments"
              search={{}}
              className="ml-1 hover:text-destructive"
              aria-label="Quitar filtro de post"
            >
              <X className="h-3 w-3" />
            </Link>
          </Badge>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comentario</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Denuncias</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay comentarios para mostrar
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm">{comment.text}</p>
                  </TableCell>
                  <TableCell className="max-w-[160px]">
                    <Link
                      to="/dashboard/debate/$postId"
                      params={{ postId: comment.post.id }}
                      className="truncate text-sm text-muted-foreground hover:underline block"
                    >
                      {comment.post.description}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{comment.author.name ?? 'Sin nombre'}</TableCell>
                  <TableCell>
                    <CommentStatusBadge status={comment.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {comment.reports.length > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 font-mono"
                        title={comment.reports
                          .map((r) => REPORT_REASON_LABELS[r.reason])
                          .join(', ')}
                      >
                        <Flag className="h-3 w-3 text-destructive" />
                        {comment.reports.length}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {comment.status === 'FLAGGED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Aprobar comentario"
                          onClick={() => approveMutation.mutate(comment.id)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {comment.status !== 'REMOVED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar comentario"
                          onClick={() => setRemoveTarget(comment)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
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

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              El comentario dejará de mostrarse a los usuarios y sus denuncias pendientes
              quedarán resueltas. Esta acción no se puede deshacer desde el backoffice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CommentStatusBadge({ status }: { status: DebateComment['status'] }) {
  if (status === 'REMOVED') return <Badge variant="secondary">Eliminado</Badge>
  if (status === 'FLAGGED') return <Badge variant="destructive">Flaggeado</Badge>
  return <Badge>Visible</Badge>
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
