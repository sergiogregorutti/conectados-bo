import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, RefreshCw, ShieldOff } from 'lucide-react'
import { useReportedUsers } from '@/hooks/useReports'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { REASON_LABELS } from '@/types/report'
import type { ReportedUserSummary, ReportsFilterStatus } from '@/types/report'

// Filtros y paginación viven en la URL (mismo patrón que el resto de
// listados): si no, al entrar al detalle de un caso y volver con "atrás" se
// pierden la página y los filtros.
// .default() (no solo .catch()) es necesario para que TanStack Router sepa,
// a nivel de tipos, que estos campos son opcionales al navegar hacia esta
// ruta; .catch() de más protege contra valores inválidos en la URL.
const reportsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  search: z.string().default('').catch(''),
  status: z.enum(['pending', 'all']).default('pending').catch('pending'),
})

export const Route = createFileRoute('/dashboard/reports/')({
  validateSearch: reportsSearchSchema,
  component: ReportsPage,
})

const ITEMS_PER_PAGE = 20

function ReportsPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = search
  const statusFilter: ReportsFilterStatus = search.status

  const { data, isLoading, refetch, isFetching } = useReportedUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search: search.search || undefined,
    status: statusFilter,
  })

  const items = data?.users ?? []
  const pagination = data?.pagination

  const setPage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  const handleSearchChange = (value: string) => {
    navigate({ search: (prev) => ({ ...prev, search: value, page: 1 }), replace: true })
  }

  const handleStatusChange = (value: ReportsFilterStatus) => {
    navigate({ search: (prev) => ({ ...prev, status: value, page: 1 }), replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportados</h1>
          <p className="text-muted-foreground">
            Usuarios reportados por otros usuarios o en comentarios del debate
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Buscar por nombre o ID..."
          value={search.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => handleStatusChange(v as ReportsFilterStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Con reportes pendientes</SelectItem>
            <SelectItem value="all">Todos (incluye resueltos)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Motivos</TableHead>
              <TableHead className="text-right">Pendientes</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Último reporte</TableHead>
              <TableHead>Estado de la cuenta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {statusFilter === 'pending'
                    ? 'No hay reportes pendientes'
                    : 'No hay usuarios reportados'}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => <ReportedUserRow key={item.user.id} item={item} />)
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
    </div>
  )
}

function ReportedUserRow({ item }: { item: ReportedUserSummary }) {
  const { user } = item
  const initials = (user.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <TableRow>
      <TableCell>
        <Link
          to="/dashboard/reports/$userId"
          params={{ userId: user.id }}
          className="flex items-center gap-3 group"
        >
          <Avatar>
            {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name ?? ''} /> : null}
            <AvatarFallback>{initials || '?'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate group-hover:underline">
              {user.name ?? 'Sin nombre'}
            </p>
            <p className="font-mono text-xs text-muted-foreground truncate">{user.id}</p>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {item.reasons.map((reason) => (
            <Badge key={reason} variant="outline">
              {REASON_LABELS[reason] ?? reason}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right font-mono">
        {item.pendingCount > 0 ? (
          <Badge variant="destructive">{item.pendingCount}</Badge>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground">
        {item.totalCount}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(item.lastReportAt)}
      </TableCell>
      <TableCell>
        {user.disabled ? (
          <Badge variant="destructive" className="gap-1">
            <ShieldOff className="h-3 w-3" />
            Deshabilitado
          </Badge>
        ) : (
          <Badge variant="outline">Activo</Badge>
        )}
      </TableCell>
    </TableRow>
  )
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
