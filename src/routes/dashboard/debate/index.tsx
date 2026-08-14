import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  Heart,
} from 'lucide-react'
import { usePosts, useTogglePost } from '@/hooks/usePosts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import type { DebatePost, PostStatus } from '@/types/post'

export const Route = createFileRoute('/dashboard/debate/')({
  component: DebatePage,
})

const ITEMS_PER_PAGE = 20

function DebatePage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PostStatus>('all')

  const { data, isLoading, refetch, isFetching } = usePosts({
    page,
    limit: ITEMS_PER_PAGE,
    status: statusFilter,
  })

  const toggleMutation = useTogglePost()

  const posts = data?.data ?? []
  const pagination = data?.pagination

  const handleStatusChange = (value: PostStatus) => {
    setStatusFilter(value)
    setPage(1)
  }

  const onToggle = (post: DebatePost) => {
    toggleMutation.mutate({ id: post.id, isActive: !post.isActive })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Debate</h1>
          <p className="text-muted-foreground">
            Gestiona los posts de debate de la aplicación
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/dashboard/debate/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear post
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={(v) => handleStatusChange(v as PostStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
            <SelectItem value="scheduled">Programados</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Publicación</TableHead>
              <TableHead className="text-right">Comentarios</TableHead>
              <TableHead className="text-right">Reacciones</TableHead>
              <TableHead className="text-center">Activo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay posts para mostrar
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={post.imageUrl}
                        alt={post.description}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <p className="max-w-md truncate text-sm font-medium">
                        {post.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge post={post} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(post.publishedAt)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      {formatNumber(post._count?.comments ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3 text-muted-foreground" />
                      {formatNumber(post._count?.reactions ?? 0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={post.isActive}
                      onCheckedChange={() => onToggle(post)}
                      disabled={toggleMutation.isPending}
                    />
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
    </div>
  )
}

function StatusBadge({ post }: { post: DebatePost }) {
  if (!post.isActive) {
    return <Badge variant="secondary">Inactivo</Badge>
  }
  if (new Date(post.publishedAt).getTime() > Date.now()) {
    return <Badge variant="outline">Programado</Badge>
  }
  return <Badge>Publicado</Badge>
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

function formatNumber(num: number) {
  return new Intl.NumberFormat('es-AR').format(num)
}
